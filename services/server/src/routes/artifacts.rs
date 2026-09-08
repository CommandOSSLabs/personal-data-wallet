//! `/api/artifacts` — store / get / list encrypted file attachments.
//!
//! No embedding. Ciphertext is a MEMWALV2 envelope whose plaintext is the
//! `MWARTV01` payload. Managed Oyster + `namespace::write_fence`, same as V2
//! remember, but rows live in `artifacts` (not `vector_entries`).

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::{Extension, Json};
use base64::Engine as _;
use std::sync::Arc;

use crate::jobs::WalletOperation;
use crate::rate_limit;
use crate::storage::artifact::{
    decode_payload, encode_payload, sanitize_filename, sanitize_mime, sanitize_source,
    ArtifactPayload, MAX_ARTIFACT_BYTES,
};
use crate::storage::seal::SealCredential;
use crate::storage::v2::{self, V2Namespace};
use crate::types::*;

use super::enqueue_wallet_job;

#[derive(sqlx::FromRow)]
#[allow(dead_code)]
struct ArtifactRow {
    id: String,
    owner: String,
    namespace: String,
    filename: String,
    mime_type: String,
    source: String,
    status: String,
    byte_size: i64,
    blob_id: Option<String>,
    error_msg: Option<String>,
    namespace_object_id: Option<String>,
    key_version: Option<i64>,
    storage_mode: Option<String>,
    oyster_bucket: Option<String>,
    oyster_key: Option<String>,
    pooled_blob_object_id: Option<String>,
    ciphertext_digest: Option<Vec<u8>>,
    commitment: Option<Vec<u8>>,
    fence_tx_digest: Option<String>,
}

fn row_to_record(row: ArtifactRow, owner: String, bytes_b64: Option<String>) -> ArtifactRecord {
    ArtifactRecord {
        artifact_id: row.id,
        owner,
        namespace: row.namespace,
        filename: row.filename,
        mime_type: row.mime_type,
        source: row.source,
        status: row.status,
        byte_size: row.byte_size,
        blob_id: row.blob_id,
        error: row.error_msg,
        storage_mode: row.storage_mode,
        bytes_b64,
    }
}

async fn mark_artifact_failed(state: &AppState, artifact_id: &str, msg: &str) {
    let _ = sqlx::query(
        "UPDATE artifacts SET status = 'failed', error_msg = $1, updated_at = NOW() WHERE id = $2",
    )
    .bind(msg)
    .bind(artifact_id)
    .execute(state.db.pool())
    .await;
}

fn spawn_prepare_artifact_job(
    state: Arc<AppState>,
    artifact_id: String,
    payload: ArtifactPayload,
    auth: AuthInfo,
    namespace_label: String,
    ns: V2Namespace,
    writer_index: usize,
) {
    let request_context = crate::observability::current_context();
    tokio::spawn(async move {
        let work = async move {
            let result: Result<(), AppError> = async {
                if !state.config.memwal_v2_managed_oyster {
                    return Err(AppError::BadRequest(
                        "artifacts require managed Oyster (MEMWAL_V2_MANAGED_OYSTER)".into(),
                    ));
                }
                let package_id = state.config.memwal_v2_package_id.as_deref().ok_or_else(|| {
                    AppError::Internal("MEMWAL_V2_PACKAGE_ID is not set".into())
                })?;
                let ns_registry = state
                    .config
                    .memwal_v2_namespace_registry_id
                    .as_deref()
                    .ok_or_else(|| {
                        AppError::Internal("MEMWAL_V2_NAMESPACE_REGISTRY_ID is not set".into())
                    })?;
                let account_registry = state.config.memwal_v2_registry_id.as_deref().ok_or_else(|| {
                    AppError::Internal("MEMWAL_V2_REGISTRY_ID is not set".into())
                })?;
                let credential = SealCredential::from_auth_or_fallback(
                    &auth,
                    state.config.sui_private_key.as_deref(),
                )
                .ok_or_else(|| {
                    AppError::Internal(
                        "SEAL credential required (x-seal-session, x-delegate-key, or SERVER_SUI_PRIVATE_KEY)"
                            .into(),
                    )
                })?;
                let dek = crate::storage::seal::unwrap_namespace_dek(
                    &state.http_client,
                    &state.config.sidecar_url,
                    state.config.sidecar_secret.as_deref(),
                    &ns.wrapped_dek,
                    &credential,
                    package_id,
                    ns_registry,
                    account_registry,
                    &auth.account_id,
                    &ns.object_id,
                )
                .await?;
                let plaintext = encode_payload(&payload)?;
                let envelope = crate::storage::seal::encrypt_v2_envelope(
                    &state.http_client,
                    &state.config.sidecar_url,
                    state.config.sidecar_secret.as_deref(),
                    &dek,
                    &plaintext,
                    &ns.object_id,
                    ns.current_key_version,
                )
                .await?;
                rate_limit::check_storage_quota(&state, &auth.owner, envelope.len() as i64).await?;

                let oyster_key = crate::storage::oyster::blob_object_key(&ns.object_id, &artifact_id);
                let stored = crate::storage::oyster::put_blob(
                    &state.http_client,
                    state.config.oyster_base_url.as_deref(),
                    state.config.oyster_api_key.as_deref(),
                    &state.config.oyster_bucket,
                    &oyster_key,
                    &envelope,
                )
                .await?;
                let commitment = v2::write_commitment_v1(
                    &ns.object_id,
                    ns.current_key_version,
                    &stored.blob_id,
                    stored.pooled_blob_object_id.as_deref(),
                    &envelope,
                )?;
                let ciphertext_digest = v2::blake2b256(&envelope).to_vec();
                sqlx::query(
                    "UPDATE artifacts SET blob_id = $1, namespace_object_id = $2, key_version = $3,
                     storage_mode = 'managed_oyster', oyster_bucket = $4, oyster_key = $5,
                     pooled_blob_object_id = $6, ciphertext_digest = $7, commitment = $8,
                     status = 'uploaded', updated_at = NOW()
                     WHERE id = $9",
                )
                .bind(&stored.blob_id)
                .bind(&ns.object_id)
                .bind(ns.current_key_version as i64)
                .bind(&state.config.oyster_bucket)
                .bind(&oyster_key)
                .bind(&stored.pooled_blob_object_id)
                .bind(&ciphertext_digest)
                .bind(commitment.as_slice())
                .bind(&artifact_id)
                .execute(state.db.pool())
                .await
                .map_err(|e| AppError::Internal(format!("Failed to update artifact row: {e}")))?;

                enqueue_wallet_job(
                    &state,
                    writer_index,
                    WalletOperation::V2WriteFence {
                        owner: auth.owner.clone(),
                        namespace: namespace_label.clone(),
                        account_id: auth.account_id.clone(),
                        namespace_object_id: ns.object_id.clone(),
                        key_version: ns.current_key_version,
                        commitment: commitment.to_vec(),
                        blob_id: stored.blob_id,
                        vector: Vec::new(),
                        blob_size_bytes: envelope.len() as i64,
                        importance: crate::services::extractor::IMPORTANCE_STANDARD,
                        oyster_bucket: state.config.oyster_bucket.clone(),
                        oyster_key,
                        pooled_blob_object_id: stored.pooled_blob_object_id,
                        ciphertext_digest,
                        storage_mode: "managed_oyster".into(),
                        remember_job_id: Some(artifact_id.clone()),
                        skip_vector: true,
                        source_artifact_id: None,
                    },
                )
                .await?;
                Ok(())
            }
            .await;
            if let Err(e) = result {
                let msg = e.to_string();
                tracing::error!("artifact preparation failed: id={} {}", artifact_id, msg);
                mark_artifact_failed(&state, &artifact_id, &msg).await;
            }
        };
        if let Some(request_context) = request_context {
            crate::observability::with_request_context(request_context, work).await;
        } else {
            work.await;
        }
    });
}

/// POST /api/artifacts
pub async fn store_artifact(
    State(state): State<Arc<AppState>>,
    Extension(auth): Extension<AuthInfo>,
    Json(body): Json<StoreArtifactRequest>,
) -> Result<(StatusCode, Json<ArtifactAcceptedResponse>), AppError> {
    validate_namespace(&body.namespace)?;
    let filename = sanitize_filename(&body.filename)?;
    let mime_type = sanitize_mime(body.mime_type.as_deref())?;
    let source = sanitize_source(body.source.as_deref())?;
    let data = base64::engine::general_purpose::STANDARD
        .decode(body.bytes_b64.trim())
        .map_err(|_| AppError::BadRequest("bytes_b64 is not valid standard base64".into()))?;
    if data.is_empty() {
        return Err(AppError::BadRequest("artifact bytes cannot be empty".into()));
    }
    if data.len() > MAX_ARTIFACT_BYTES {
        return Err(AppError::BadRequest(format!(
            "artifact exceeds maximum size of {MAX_ARTIFACT_BYTES} bytes"
        )));
    }

    let v2_ns = v2::gate_v2_label(&state, &auth, &body.namespace)
        .await?
        .ok_or_else(|| {
            AppError::BadRequest(
                "Artifacts require a V2 namespace. Create one on the dashboard, then pick it here."
                    .into(),
            )
        })?;
    let writer_index = v2::authorize_v2_write(&state, &auth, &v2_ns).await?;

    let artifact_id = uuid::Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO artifacts (id, owner, namespace, filename, mime_type, source, byte_size, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'running')",
    )
    .bind(&artifact_id)
    .bind(&auth.owner)
    .bind(&body.namespace)
    .bind(&filename)
    .bind(&mime_type)
    .bind(&source)
    .bind(data.len() as i64)
    .execute(state.db.pool())
    .await
    .map_err(|e| AppError::Internal(format!("Failed to create artifact row: {e}")))?;

    spawn_prepare_artifact_job(
        Arc::clone(&state),
        artifact_id.clone(),
        ArtifactPayload {
            filename,
            mime_type,
            source,
            data,
        },
        auth,
        body.namespace,
        v2_ns,
        writer_index,
    );

    Ok((
        StatusCode::ACCEPTED,
        Json(ArtifactAcceptedResponse {
            artifact_id,
            status: "running".into(),
        }),
    ))
}

async fn load_artifact_row(
    state: &AppState,
    owner: &str,
    artifact_id: &str,
) -> Result<ArtifactRow, AppError> {
    let row: Option<ArtifactRow> = sqlx::query_as(
        "SELECT id, owner, namespace, filename, mime_type, source, status, byte_size,
                blob_id, error_msg, namespace_object_id, key_version, storage_mode,
                oyster_bucket, oyster_key, pooled_blob_object_id, ciphertext_digest,
                commitment, fence_tx_digest
         FROM artifacts WHERE id = $1",
    )
    .bind(artifact_id)
    .fetch_optional(state.db.pool())
    .await
    .map_err(|e| AppError::Internal(format!("DB error: {e}")))?;
    match row {
        Some(r) if r.owner == owner => Ok(r),
        _ => Err(AppError::BlobNotFound(format!(
            "Artifact {artifact_id} not found"
        ))),
    }
}

/// GET /api/artifacts/:id
pub async fn get_artifact(
    State(state): State<Arc<AppState>>,
    Extension(auth): Extension<AuthInfo>,
    Path(artifact_id): Path<String>,
) -> Result<Json<ArtifactRecord>, AppError> {
    let row = load_artifact_row(&state, &auth.owner, &artifact_id).await?;
    if row.status != "done" {
        return Ok(Json(row_to_record(row, auth.owner.clone(), None)));
    }

    let namespace_object_id = row.namespace_object_id.clone().ok_or_else(|| {
        AppError::Internal("artifact is missing namespace_object_id".into())
    })?;
    let key_version = row.key_version.unwrap_or(0) as u64;
    let oyster_bucket = row
        .oyster_bucket
        .clone()
        .unwrap_or_else(|| state.config.oyster_bucket.clone());
    let blob_id = row.blob_id.clone().ok_or_else(|| {
        AppError::Internal("done artifact is missing blob_id".into())
    })?;
    let namespace_label = row.namespace.clone();
    let oyster_key = row.oyster_key.clone();

    let ns = v2::resolve_live_v2_namespace(&state, &auth.account_id, &namespace_label)
        .await?
        .ok_or_else(|| AppError::Forbidden("V2 namespace is not live".into()))?;
    let principal = v2::sui_address_from_ed25519_pubkey_hex(&auth.public_key)?;
    if !v2::namespace_has_permission(&state, &ns, &principal, false).await? {
        return Err(AppError::Forbidden(
            "HTTP principal cannot read this V2 namespace".into(),
        ));
    }

    let mut envelope = None;
    if let Some(key) = oyster_key.as_deref() {
        match crate::storage::oyster::get_blob(
            &state.http_client,
            state.config.oyster_base_url.as_deref(),
            state.config.oyster_api_key.as_deref(),
            &oyster_bucket,
            key,
        )
        .await
        {
            Ok(bytes) => envelope = Some(bytes),
            Err(AppError::BlobNotFound(_)) => {}
            Err(e) => return Err(e),
        }
    }
    if envelope.is_none() {
        envelope = Some(
            crate::storage::oyster::get_blob_by_id(
                &state.http_client,
                state.config.oyster_base_url.as_deref(),
                state.config.oyster_api_key.as_deref(),
                &blob_id,
            )
            .await?,
        );
    }
    let envelope = envelope.ok_or_else(|| {
        AppError::BlobNotFound(format!("artifact blob {blob_id} not found"))
    })?;

    let package_id = state
        .config
        .memwal_v2_package_id
        .as_deref()
        .ok_or_else(|| AppError::Internal("MEMWAL_V2_PACKAGE_ID is not set".into()))?;
    let ns_registry = state
        .config
        .memwal_v2_namespace_registry_id
        .as_deref()
        .ok_or_else(|| AppError::Internal("MEMWAL_V2_NAMESPACE_REGISTRY_ID is not set".into()))?;
    let account_registry = state
        .config
        .memwal_v2_registry_id
        .as_deref()
        .ok_or_else(|| AppError::Internal("MEMWAL_V2_REGISTRY_ID is not set".into()))?;
    let credential = SealCredential::from_auth_or_fallback(
        &auth,
        state.config.sui_private_key.as_deref(),
    )
    .ok_or_else(|| {
        AppError::Internal(
            "SEAL credential required (x-seal-session, x-delegate-key, or SERVER_SUI_PRIVATE_KEY)"
                .into(),
        )
    })?;
    let wrapped = v2::fetch_wrapped_dek(
        &v2::V2Rpc::from_state(&state),
        &namespace_object_id,
        key_version,
        package_id,
    )
    .await?;
    let dek = crate::storage::seal::unwrap_namespace_dek(
        &state.http_client,
        &state.config.sidecar_url,
        state.config.sidecar_secret.as_deref(),
        &wrapped,
        &credential,
        package_id,
        ns_registry,
        account_registry,
        &auth.account_id,
        &namespace_object_id,
    )
    .await?;
    let plaintext = crate::storage::seal::decrypt_v2_envelope(
        &state.http_client,
        &state.config.sidecar_url,
        state.config.sidecar_secret.as_deref(),
        &dek,
        &envelope,
    )
    .await?;
    let decoded = decode_payload(&plaintext)?;
    let bytes_b64 = base64::engine::general_purpose::STANDARD.encode(&decoded.data);
    Ok(Json(row_to_record(row, auth.owner.clone(), Some(bytes_b64))))
}

/// POST /api/artifacts/list
pub async fn list_artifacts(
    State(state): State<Arc<AppState>>,
    Extension(auth): Extension<AuthInfo>,
    Json(body): Json<ListArtifactsRequest>,
) -> Result<Json<ListArtifactsResponse>, AppError> {
    validate_namespace(&body.namespace)?;
    let rows: Vec<ArtifactRow> = sqlx::query_as(
        "SELECT id, owner, namespace, filename, mime_type, source, status, byte_size,
                blob_id, error_msg, namespace_object_id, key_version, storage_mode,
                oyster_bucket, oyster_key, pooled_blob_object_id, ciphertext_digest,
                commitment, fence_tx_digest
         FROM artifacts
         WHERE owner = $1 AND namespace = $2
         ORDER BY created_at DESC
         LIMIT 100",
    )
    .bind(&auth.owner)
    .bind(&body.namespace)
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| AppError::Internal(format!("DB error: {e}")))?;
    Ok(Json(ListArtifactsResponse {
        artifacts: rows
            .into_iter()
            .map(|row| row_to_record(row, auth.owner.clone(), None))
            .collect(),
    }))
}
