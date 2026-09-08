//! Binary inner payload for V2 artifacts.
//!
//! Outer bytes are still a MEMWALV2 AES-GCM envelope. This codec is the
//! plaintext inside that envelope so a restore can recover filename/mime
//! without trusting the index.

use crate::types::AppError;

pub const MAGIC: &[u8; 8] = b"MWARTV01";
pub const MAX_FILENAME_BYTES: usize = 255;
pub const MAX_MIME_BYTES: usize = 128;
pub const MAX_SOURCE_BYTES: usize = 128;
pub const MAX_ARTIFACT_BYTES: usize = 8 * 1024 * 1024;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ArtifactPayload {
    pub filename: String,
    pub mime_type: String,
    pub source: String,
    pub data: Vec<u8>,
}

fn push_len_prefixed_u16(out: &mut Vec<u8>, bytes: &[u8]) -> Result<(), AppError> {
    let len = u16::try_from(bytes.len()).map_err(|_| {
        AppError::BadRequest("artifact field exceeds 65535 bytes".into())
    })?;
    out.extend_from_slice(&len.to_le_bytes());
    out.extend_from_slice(bytes);
    Ok(())
}

fn read_len_prefixed_u16<'a>(input: &'a [u8], cursor: &mut usize) -> Result<&'a [u8], AppError> {
    if *cursor + 2 > input.len() {
        return Err(AppError::BadRequest("truncated artifact payload".into()));
    }
    let len = u16::from_le_bytes(input[*cursor..*cursor + 2].try_into().unwrap()) as usize;
    *cursor += 2;
    if *cursor + len > input.len() {
        return Err(AppError::BadRequest("truncated artifact payload".into()));
    }
    let slice = &input[*cursor..*cursor + len];
    *cursor += len;
    Ok(slice)
}

pub fn encode_payload(payload: &ArtifactPayload) -> Result<Vec<u8>, AppError> {
    if payload.data.is_empty() {
        return Err(AppError::BadRequest("artifact bytes cannot be empty".into()));
    }
    if payload.data.len() > MAX_ARTIFACT_BYTES {
        return Err(AppError::BadRequest(format!(
            "artifact exceeds maximum size of {MAX_ARTIFACT_BYTES} bytes"
        )));
    }
    let filename = payload.filename.as_bytes();
    let mime = payload.mime_type.as_bytes();
    let source = payload.source.as_bytes();
    if filename.len() > MAX_FILENAME_BYTES {
        return Err(AppError::BadRequest("filename is too long".into()));
    }
    if mime.len() > MAX_MIME_BYTES {
        return Err(AppError::BadRequest("mime_type is too long".into()));
    }
    if source.len() > MAX_SOURCE_BYTES {
        return Err(AppError::BadRequest("source is too long".into()));
    }
    let mut out = Vec::with_capacity(8 + 2 + filename.len() + 2 + mime.len() + 2 + source.len() + 4 + payload.data.len());
    out.extend_from_slice(MAGIC);
    push_len_prefixed_u16(&mut out, filename)?;
    push_len_prefixed_u16(&mut out, mime)?;
    push_len_prefixed_u16(&mut out, source)?;
    let data_len = u32::try_from(payload.data.len()).map_err(|_| {
        AppError::BadRequest("artifact exceeds maximum size".into())
    })?;
    out.extend_from_slice(&data_len.to_le_bytes());
    out.extend_from_slice(&payload.data);
    Ok(out)
}

pub fn decode_payload(bytes: &[u8]) -> Result<ArtifactPayload, AppError> {
    if bytes.len() < 8 + 2 + 2 + 2 + 4 {
        return Err(AppError::BadRequest("artifact payload too short".into()));
    }
    if &bytes[..8] != MAGIC {
        return Err(AppError::BadRequest("artifact payload is not MWARTV01".into()));
    }
    let mut cursor = 8;
    let filename = std::str::from_utf8(read_len_prefixed_u16(bytes, &mut cursor)?)
        .map_err(|_| AppError::BadRequest("artifact filename is not utf-8".into()))?
        .to_string();
    let mime_type = std::str::from_utf8(read_len_prefixed_u16(bytes, &mut cursor)?)
        .map_err(|_| AppError::BadRequest("artifact mime_type is not utf-8".into()))?
        .to_string();
    let source = std::str::from_utf8(read_len_prefixed_u16(bytes, &mut cursor)?)
        .map_err(|_| AppError::BadRequest("artifact source is not utf-8".into()))?
        .to_string();
    if cursor + 4 > bytes.len() {
        return Err(AppError::BadRequest("truncated artifact payload".into()));
    }
    let data_len = u32::from_le_bytes(bytes[cursor..cursor + 4].try_into().unwrap()) as usize;
    cursor += 4;
    if cursor + data_len != bytes.len() {
        return Err(AppError::BadRequest("artifact payload length mismatch".into()));
    }
    Ok(ArtifactPayload {
        filename,
        mime_type,
        source,
        data: bytes[cursor..].to_vec(),
    })
}

pub fn sanitize_filename(name: &str) -> Result<String, AppError> {
    let trimmed = name.trim();
    let base = trimmed
        .replace('\\', "/")
        .rsplit('/')
        .next()
        .unwrap_or("")
        .trim()
        .to_string();
    if base.is_empty() || base == "." || base == ".." {
        return Err(AppError::BadRequest("filename is required".into()));
    }
    if base.as_bytes().len() > MAX_FILENAME_BYTES {
        return Err(AppError::BadRequest("filename is too long".into()));
    }
    if base.chars().any(|c| c.is_control()) {
        return Err(AppError::BadRequest("filename contains control characters".into()));
    }
    Ok(base)
}

pub fn sanitize_mime(mime: Option<&str>) -> Result<String, AppError> {
    let value = mime
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .unwrap_or("application/octet-stream");
    if value.as_bytes().len() > MAX_MIME_BYTES {
        return Err(AppError::BadRequest("mime_type is too long".into()));
    }
    if value.chars().any(|c| c.is_control()) {
        return Err(AppError::BadRequest("mime_type contains control characters".into()));
    }
    Ok(value.to_string())
}

pub fn sanitize_source(source: Option<&str>) -> Result<String, AppError> {
    let value = source
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .unwrap_or("upload");
    if value.as_bytes().len() > MAX_SOURCE_BYTES {
        return Err(AppError::BadRequest("source is too long".into()));
    }
    if value.chars().any(|c| c.is_control()) {
        return Err(AppError::BadRequest("source contains control characters".into()));
    }
    Ok(value.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn payload_roundtrip() {
        let original = ArtifactPayload {
            filename: "notes.pdf".into(),
            mime_type: "application/pdf".into(),
            source: "attachment".into(),
            data: b"%PDF-1.4 hello".to_vec(),
        };
        let encoded = encode_payload(&original).unwrap();
        assert!(encoded.starts_with(MAGIC));
        let decoded = decode_payload(&encoded).unwrap();
        assert_eq!(decoded, original);
    }

    #[test]
    fn rejects_empty_data() {
        let payload = ArtifactPayload {
            filename: "a.txt".into(),
            mime_type: "text/plain".into(),
            source: "upload".into(),
            data: vec![],
        };
        assert!(encode_payload(&payload).is_err());
    }

    #[test]
    fn rejects_bad_magic() {
        let mut encoded = encode_payload(&ArtifactPayload {
            filename: "a.txt".into(),
            mime_type: "text/plain".into(),
            source: "upload".into(),
            data: b"hi".to_vec(),
        })
        .unwrap();
        encoded[0] = b'X';
        assert!(decode_payload(&encoded).is_err());
    }

    #[test]
    fn sanitize_filename_strips_path() {
        assert_eq!(
            sanitize_filename(" /tmp/../secret/report.pdf ").unwrap(),
            "report.pdf"
        );
        assert!(sanitize_filename("../").is_err());
        assert!(sanitize_filename("").is_err());
    }
}
