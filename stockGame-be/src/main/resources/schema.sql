-- stockgame MySQL 스키마 (Docker/MySQL 프로필용)
-- Hibernate ddl-auto=none 일 때 사용. 테이블이 없을 때만 생성.
-- 기존 stocks 테이블에 change 컬럼이 있다면: ALTER TABLE stocks CHANGE `change` price_change DOUBLE NOT NULL;
-- 기존 stocks 테이블에 previous_price 컬럼이 있다면: ALTER TABLE stocks DROP COLUMN previous_price;
-- 기존 stocks 테이블에 current_price 컬럼이 있다면: ALTER TABLE stocks DROP COLUMN current_price;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255) NULL,
    kakao_id VARCHAR(255) NULL UNIQUE,
    google_id VARCHAR(255) NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    balance DECIMAL(15,2) NOT NULL DEFAULT 10000000,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    last_login_at TIMESTAMP(6) NULL,
    is_leaderboard_visible TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    created_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stocks (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(255) NOT NULL UNIQUE,
    price_change DOUBLE NOT NULL,
    change_percent DOUBLE NOT NULL,
    volume BIGINT NOT NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL
);

-- 기존 news 테이블 마이그레이션: ALTER TABLE news ADD COLUMN reliability VARCHAR(20) NULL;
-- 기존 news: UPDATE news SET content = CONCAT(COALESCE(title,''), '\n', COALESCE(summary,''), '\n', content); ALTER TABLE news DROP COLUMN title, DROP COLUMN summary;
CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    reliability VARCHAR(20) NULL,
    published_at TIMESTAMP(6) NULL,
    is_published TINYINT(1) NOT NULL DEFAULT 0,
    publish_year INT NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL
);

CREATE TABLE IF NOT EXISTS stock_price_history (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    stock_id VARCHAR(36) NOT NULL,
    year INT NOT NULL,
    price DOUBLE NOT NULL,
    UNIQUE KEY uk_stock_year (stock_id, year),
    CONSTRAINT fk_price_history_stock FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS portfolios (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    stock_id VARCHAR(36) NOT NULL,
    quantity BIGINT NOT NULL,
    average_price DOUBLE NOT NULL,
    created_at TIMESTAMP(6) NULL,
    updated_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_portfolio_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_portfolio_stock FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    stock_id VARCHAR(36) NOT NULL,
    type VARCHAR(10) NOT NULL,
    quantity BIGINT NOT NULL,
    price DOUBLE NOT NULL,
    total_amount DOUBLE NOT NULL,
    created_at TIMESTAMP(6) NULL,
    CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tx_stock FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_config (
    config_key VARCHAR(100) NOT NULL PRIMARY KEY,
    config_value VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    username VARCHAR(255) NOT NULL,
    total_assets DECIMAL(15,2) NOT NULL DEFAULT 0,
    cash_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    stock_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    ranking INT NOT NULL DEFAULT 0,
    is_visible TINYINT(1) NOT NULL DEFAULT 1,
    profit_loss DECIMAL(15,2) NOT NULL DEFAULT 0,
    profit_loss_percent DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP(6) NULL,
    last_updated TIMESTAMP(6) NULL,
    CONSTRAINT fk_leaderboard_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
