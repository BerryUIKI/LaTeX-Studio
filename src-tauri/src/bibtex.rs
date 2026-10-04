use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BibEntry {
    pub key: String,
    pub entry_type: String,
    pub title: Option<String>,
    pub author: Option<String>,
    pub year: Option<String>,
    pub journal: Option<String>,
    pub booktitle: Option<String>,
}

/// Ultra-fast streaming BibTeX parser
pub fn index_bibtex_content(content: &str) -> Vec<BibEntry> {
    let mut entries = Vec::new();
    let entry_header_re = Regex::new(r"(?i)@(\w+)\s*\{\s*([^,\s]+)\s*,").unwrap();
    let field_re = Regex::new(r#"(?i)^\s*(\w+)\s*=\s*[\{"](.+?)[\}"]\s*,?\s*$"#).unwrap();

    let chunks: Vec<&str> = content.split("\n@").collect();

    for chunk in chunks {
        let chunk_with_at = if chunk.starts_with('@') {
            chunk.to_string()
        } else {
            format!("@{}", chunk)
        };

        if let Some(header_caps) = entry_header_re.captures(&chunk_with_at) {
            let entry_type = header_caps.get(1).map_or("", |m| m.as_str()).to_lowercase();
            let key = header_caps.get(2).map_or("", |m| m.as_str()).to_string();

            let mut fields = HashMap::new();

            for line in chunk_with_at.lines() {
                if let Some(f_caps) = field_re.captures(line) {
                    let field_name = f_caps.get(1).map_or("", |m| m.as_str()).to_lowercase();
                    let field_val = f_caps.get(2).map_or("", |m| m.as_str()).trim().to_string();
                    fields.insert(field_name, field_val);
                }
            }

            entries.push(BibEntry {
                key,
                entry_type,
                title: fields.remove("title"),
                author: fields.remove("author"),
                year: fields.remove("year"),
                journal: fields.remove("journal"),
                booktitle: fields.remove("booktitle"),
            });
        }
    }

    entries
}
