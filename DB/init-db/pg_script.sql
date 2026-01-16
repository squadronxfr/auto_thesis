-- USER

CREATE TABLE USER (
    id BIGSERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'USER')),
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);
 

-- TOKENS

CREATE TABLE TOKEN (
    id BIGSERIAL PRIMARY KEY,
    token_string TEXT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(), 
    CONSTRAINT fk_token_user
        FOREIGN KEY (user_id) REFERENCES USER(id) ON DELETE CASCADE
);
 

-- REQUESTS (user requests)

CREATE TABLE REQUEST (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
    user_id BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_request_user
        FOREIGN KEY (user_id) REFERENCES USER(id) ON DELETE CASCADE
);
 

-- ACTIVITY

CREATE TABLE ACTIVITY (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    request_id BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(), 
    CONSTRAINT fk_activity_request
        FOREIGN KEY (request_id) REFERENCES REQUEST(id) ON DELETE CASCADE
);
 

-- DOCUMENTS

CREATE TABLE DOCUMENT (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('SOURCE', 'FINAL')),
    request_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_document_request
        FOREIGN KEY (request_id) REFERENCES REQUEST(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_user
        FOREIGN KEY (user_id) REFERENCES USER(id) ON DELETE CASCADE
);
 

-- REQUEST STEPS

CREATE TABLE REQUEST_STEP (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    order_index INTEGER NOT NULL,
    token_cost INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_request_step_request
        FOREIGN KEY (request_id) REFERENCES REQUEST(id) ON DELETE CASCADE,
    CONSTRAINT uq_request_step_order
        UNIQUE (request_id, order_index)
);
 

-- SOURCE

CREATE TABLE SOURCE (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    link TEXT NOT NULL,
    date DATE,
    CONSTRAINT fk_source_document
        FOREIGN KEY (document_id) REFERENCES DOCUMENT(id) ON DELETE CASCADE
);
 

-- INDEXES (performance)

CREATE INDEX idx_token_user_id ON TOKEN(user_id);
CREATE INDEX idx_request_user_id ON REQUEST(user_id);
CREATE INDEX idx_activity_request_id ON ACTIVITY(request_id);
CREATE INDEX idx_document_request_id ON DOCUMENT(request_id);
CREATE INDEX idx_document_user_id ON DOCUMENT(user_id);
CREATE INDEX idx_request_step_request_id ON REQUEST_STEP(request_id);
CREATE INDEX idx_source_document_id ON SOURCE(document_id);