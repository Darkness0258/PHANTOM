use anyhow::Result;
use serde::Serialize;

pub struct TransportClient {
    client:   reqwest::Client,
    base_url: String,
}

impl TransportClient {
    pub fn new(base_url: &str) -> Self {
        Self {
            client:   reqwest::Client::new(),
            base_url: base_url.to_string(),
        }
    }

    pub async fn post<T: Serialize>(&self, path: &str, payload: &T) -> Result<()> {
        let url = format!("{}{}", self.base_url, path);
        self.client.post(&url).json(payload).send().await?;
        Ok(())
    }
}