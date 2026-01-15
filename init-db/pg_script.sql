 
-- USERS
 
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'CLIENT'))
);

 
-- TOKENS
 
CREATE TABLE token (
    id BIGSERIAL PRIMARY KEY,
    token_string TEXT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,

    CONSTRAINT fk_token_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

 
-- REQUESTS (user requests)
 
CREATE TABLE request (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
    user_id BIGINT NOT NULL,

    CONSTRAINT fk_request_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

 
-- ACTIVITY (request progress tracking)
 
CREATE TABLE activity (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    request_id BIGINT NOT NULL,

    CONSTRAINT fk_activity_request
        FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE
);

 
-- DOCUMENTS
-- (sent document / final document)
 
CREATE TABLE document (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('SOURCE', 'FINAL')),
    request_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,

    CONSTRAINT fk_document_request
        FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE,

    CONSTRAINT fk_document_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

 
-- REQUEST STEPS
 
CREATE TABLE request_step (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    order_index INTEGER NOT NULL,
    content TEXT NOT NULL,

    CONSTRAINT fk_request_step_request
        FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE,

    CONSTRAINT uq_request_step_order
        UNIQUE (request_id, order_index)
);

 
-- INDEXES (performance)
 
CREATE INDEX idx_token_user_id ON token(user_id);
CREATE INDEX idx_request_user_id ON request(user_id);
CREATE INDEX idx_activity_request_id ON activity(request_id);
CREATE INDEX idx_document_request_id ON document(request_id);
CREATE INDEX idx_document_user_id ON document(user_id);
CREATE INDEX idx_request_step_request_id ON request_step(request_id);
