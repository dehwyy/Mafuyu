pub mod json;
pub mod errors;

pub type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;