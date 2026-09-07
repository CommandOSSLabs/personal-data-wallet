//! Privacy-preserving lexical index for hybrid recall (WALM-444).
//!
//! PostgreSQL FTS/`tsvector` would persist reconstructable terms and violate
//! the SEAL at-rest floor (WALM-102). Instead, remember-time extracts
//! high-entropy identifiers, HMAC-SHA256s them with `owner` + the relayer
//! pepper, and stores the hex digests in `vector_entries.lexical_tokens`.
//! Recall tokenizes the query the same way. This is not BM25.

use std::collections::{BTreeSet, HashMap};

use hmac::{Hmac, Mac};
use regex::Regex;
use sha2::Sha256;

use crate::types::SearchHit;

type HmacSha256 = Hmac<Sha256>;

/// RRF constant — same as `apps/researcher/lib/rag/retrieve/fusion.ts`.
pub const RRF_K: f64 = 60.0;

/// Cosine distance assigned to a hit that lexical search found but ANN did not.
/// Cosine distance is in `[0, 2]`; `1.0` is orthogonal / "no semantic evidence".
pub const LEXICAL_ONLY_DISTANCE: f64 = 1.0;

const MAX_TERMS: usize = 64;

/// Identifier-shaped terms from `text`, lowercased and de-duplicated.
pub fn extract_terms(text: &str) -> Vec<String> {
    let mut terms = BTreeSet::new();
    for cap in hex_re().find_iter(text) {
        let mut t = cap.as_str().to_ascii_lowercase();
        if let Some(stripped) = t.strip_prefix("0x") {
            t = stripped.to_string();
        }
        if t.len() >= 16 {
            terms.insert(t);
        }
    }
    for cap in uuid_re().find_iter(text) {
        terms.insert(cap.as_str().to_ascii_lowercase());
    }
    for cap in snake_re().find_iter(text) {
        terms.insert(cap.as_str().to_ascii_lowercase());
    }
    for cap in camel_re().find_iter(text) {
        terms.insert(cap.as_str().to_ascii_lowercase());
    }
    for cap in version_re().find_iter(text) {
        terms.insert(cap.as_str().to_ascii_lowercase());
    }
    terms.into_iter().take(MAX_TERMS).collect()
}

/// HMAC-SHA256 hex digests of [`extract_terms`], keyed by pepper + owner.
pub fn token_hmacs(pepper: &str, owner: &str, text: &str) -> Vec<String> {
    extract_terms(text)
        .into_iter()
        .map(|term| hmac_term(pepper, owner, &term))
        .collect()
}

pub fn hmac_term(pepper: &str, owner: &str, term: &str) -> String {
    let mut mac = HmacSha256::new_from_slice(pepper.as_bytes())
        .expect("HMAC-SHA256 accepts a key of any length");
    mac.update(owner.as_bytes());
    mac.update(&[0]);
    mac.update(term.as_bytes());
    hex::encode(mac.finalize().into_bytes())
}

/// Reciprocal Rank Fusion of a semantic list and a lexical list.
///
/// Rank is 1-based. A document missing from one list gets penalty rank
/// `len(list) + 1`. Hits present in both keep the semantic `SearchHit`
/// (real cosine distance). Ties break on `id` ascending.
pub fn rrf_fuse(semantic: Vec<SearchHit>, lexical: Vec<SearchHit>, limit: usize) -> Vec<SearchHit> {
    if semantic.is_empty() {
        return lexical.into_iter().take(limit).collect();
    }
    if lexical.is_empty() {
        return semantic.into_iter().take(limit).collect();
    }

    let mut by_id: HashMap<String, SearchHit> = HashMap::new();
    let mut sem_rank: HashMap<String, usize> = HashMap::new();
    for (i, hit) in semantic.into_iter().enumerate() {
        sem_rank.insert(hit.id.clone(), i + 1);
        by_id.insert(hit.id.clone(), hit);
    }
    let mut lex_rank: HashMap<String, usize> = HashMap::new();
    for (i, hit) in lexical.into_iter().enumerate() {
        lex_rank.insert(hit.id.clone(), i + 1);
        by_id.entry(hit.id.clone()).or_insert(hit);
    }

    let sem_penalty = sem_rank.len() + 1;
    let lex_penalty = lex_rank.len() + 1;

    let mut scored: Vec<(SearchHit, f64)> = by_id
        .into_values()
        .map(|hit| {
            let s = *sem_rank.get(&hit.id).unwrap_or(&sem_penalty);
            let l = *lex_rank.get(&hit.id).unwrap_or(&lex_penalty);
            let rrf = 1.0 / (RRF_K + s as f64) + 1.0 / (RRF_K + l as f64);
            (hit, rrf)
        })
        .collect();

    scored.sort_by(|a, b| {
        b.1.total_cmp(&a.1).then_with(|| a.0.id.cmp(&b.0.id))
    });
    scored.into_iter().take(limit).map(|(hit, _)| hit).collect()
}

fn hex_re() -> &'static Regex {
    static RE: std::sync::OnceLock<Regex> = std::sync::OnceLock::new();
    RE.get_or_init(|| Regex::new(r"(?i)\b(?:0x)?[0-9a-f]{16,}\b").expect("hex regex"))
}

fn uuid_re() -> &'static Regex {
    static RE: std::sync::OnceLock<Regex> = std::sync::OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(r"(?i)\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b")
            .expect("uuid regex")
    })
}

fn snake_re() -> &'static Regex {
    static RE: std::sync::OnceLock<Regex> = std::sync::OnceLock::new();
    RE.get_or_init(|| Regex::new(r"\b[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)+\b").expect("snake regex"))
}

fn camel_re() -> &'static Regex {
    static RE: std::sync::OnceLock<Regex> = std::sync::OnceLock::new();
    RE.get_or_init(|| Regex::new(r"\b[A-Za-z]+[A-Z][A-Za-z0-9]*\b").expect("camel regex"))
}

fn version_re() -> &'static Regex {
    static RE: std::sync::OnceLock<Regex> = std::sync::OnceLock::new();
    RE.get_or_init(|| Regex::new(r"\bv?\d+\.\d+(?:\.\d+)*\b").expect("version regex"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{TimeZone, Utc};

    fn hit(id: &str, distance: f64) -> SearchHit {
        SearchHit {
            id: id.into(),
            blob_id: format!("blob-{id}"),
            distance,
            created_at: Utc.with_ymd_and_hms(2026, 1, 1, 0, 0, 0).unwrap(),
            importance: 0.5,
        }
    }

    #[test]
    fn extract_sui_address_uuid_snake_and_version() {
        let text = "delegate 0x2b84a32bcbe5f21c56d453dbe9f2c6a83b5f5a0c91d7e3f4a1b2c3d4e5f60708 via add_delegate_key; err v1.2.3 uuid 550e8400-e29b-41d4-a716-446655440000";
        let terms = extract_terms(text);
        assert!(
            terms.iter().any(|t| t == "2b84a32bcbe5f21c56d453dbe9f2c6a83b5f5a0c91d7e3f4a1b2c3d4e5f60708"),
            "hex address stripped of 0x: {terms:?}"
        );
        assert!(terms.iter().any(|t| t == "add_delegate_key"), "{terms:?}");
        assert!(terms.iter().any(|t| t == "v1.2.3" || t == "1.2.3"), "{terms:?}");
        assert!(terms.iter().any(|t| t == "550e8400-e29b-41d4-a716-446655440000"), "{terms:?}");
    }

    #[test]
    fn identifier_match_is_case_insensitive_and_unstemmed() {
        let terms = extract_terms("Call ADD_DELEGATE_KEY then AddDelegateKey");
        assert!(terms.iter().any(|t| t == "add_delegate_key"), "{terms:?}");
        assert!(terms.iter().any(|t| t == "adddelegatekey"), "{terms:?}");
        // English stemmers would collapse running→run; we must not.
        let stemmed = extract_terms("running runner runs");
        assert!(
            !stemmed.iter().any(|t| t == "run"),
            "must not stem English: {stemmed:?}"
        );
    }

    #[test]
    fn hmac_is_deterministic_and_owner_scoped() {
        let a = token_hmacs("pepper", "0xowner", "add_delegate_key lives here");
        let b = token_hmacs("pepper", "0xowner", "add_delegate_key lives here");
        let c = token_hmacs("pepper", "0xother", "add_delegate_key lives here");
        assert_eq!(a, b);
        assert_ne!(a, c);
        assert!(a.iter().all(|t| t.len() == 64 && t.chars().all(|ch| ch.is_ascii_hexdigit())));
    }

    #[test]
    fn rrf_prefers_docs_in_both_lists() {
        let semantic = vec![hit("sem-only", 0.1), hit("both", 0.4)];
        let lexical = vec![hit("both", 1.0), hit("lex-only", 1.0)];
        let fused = rrf_fuse(semantic, lexical, 3);
        assert_eq!(fused[0].id, "both");
        let ids: Vec<_> = fused.iter().map(|h| h.id.as_str()).collect();
        assert!(ids.contains(&"sem-only"));
        assert!(ids.contains(&"lex-only"));
        assert_eq!(fused.iter().find(|h| h.id == "both").unwrap().distance, 0.4);
        assert_eq!(fused.iter().find(|h| h.id == "lex-only").unwrap().distance, 1.0);
    }

    #[test]
    fn rrf_empty_lexical_keeps_semantic_order() {
        let semantic = vec![hit("a", 0.1), hit("b", 0.2)];
        let fused = rrf_fuse(semantic, vec![], 2);
        assert_eq!(fused[0].id, "a");
        assert_eq!(fused[1].id, "b");
    }

    #[test]
    fn rrf_tie_breaks_on_id() {
        // Identical ranks → same RRF; id ASC decides.
        let semantic = vec![hit("b", 0.1), hit("a", 0.2)];
        let lexical = vec![hit("a", 1.0), hit("b", 1.0)];
        let fused = rrf_fuse(semantic, lexical, 2);
        assert_eq!(fused[0].id, "a");
        assert_eq!(fused[1].id, "b");
    }
}
