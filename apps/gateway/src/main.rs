mod service;
mod interceptors;
mod middleware;

use interceptors::remove_keep_alive::RemoveKeepAliveHeaderInterceptor;
use middleware::func::set_auth_cookies::SetTokensCookies;

use std::str::FromStr;
use std::time::Duration;

use tonic::transport::Server;
use service::service::ApiRpcServiceImplementation;

use makoto_grpc::pkg::api::api_rpc_server::ApiRpcServer;
use makoto_logger::{Logger, info};
use tonic_web::{GrpcWebLayer};
use tower_http::cors::{CorsLayer, AllowOrigin, AllowHeaders, AllowCredentials, ExposeHeaders};
use http::header::HeaderName;
use http::HeaderValue;


#[tokio::main]
async fn main() -> makoto_lib::Result<()> {

    Logger::init()?;

    let hosts = makoto_config::hosts::Hosts::new();
    let addr = hosts.gateway.parse()?;

    let api = ApiRpcServiceImplementation::new().await;
    let api_service = ApiRpcServer::new(api);

    info!("server start! host: {}", addr);

    let exposed_headers = vec!("grpc-status", "grpc-message", "grpc-status-details-bin", "x-access-token", "x-refresh-token", "set-cookie");
    let allow_origin = vec!("http://localhost:5173", "https://localhost:5173");
    let allow_headers = vec!("access_token", "refresh_token", "Content-Type", "x-grpc-web");

    let cors = CorsLayer::new()
        .expose_headers(
            ExposeHeaders::list(exposed_headers.iter().map(|s| HeaderName::from_str(s).unwrap()).collect::<Vec<_>>())
        )
        .allow_origin(
            AllowOrigin::list(allow_origin.iter().map(|s| HeaderValue::from_str(s).unwrap()).collect::<Vec<_>>())
        )
        .allow_headers(
            AllowHeaders::list(allow_headers.iter().map(|s| HeaderName::from_str(s).unwrap()).collect::<Vec<_>>()))
        .max_age(Duration::from_secs(5))
        .allow_credentials(AllowCredentials::yes());

    let set_tokens_cookies = SetTokensCookies::new();

    let app_layer = tower::ServiceBuilder::new()
        .timeout(Duration::from_secs(15))
        .layer(middleware::BaseMiddlewareLayer::new(set_tokens_cookies))
        .layer(tonic::service::interceptor(RemoveKeepAliveHeaderInterceptor::intercept))
        .layer(cors)
        .layer(GrpcWebLayer::new())
        .into_inner();

    Server::builder()
        .accept_http1(true)
        .layer(app_layer)
        .add_service(api_service)
        .serve(addr)
        .await?;


    Ok(())
}
