-- ==========================================
-- STRUCTURE DE LA BASE DE DONNÉES (SCHEMA)
-- ==========================================

-- TABLES

CREATE TABLE "USER" (
    id BIGSERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE TOKEN (
    id BIGSERIAL PRIMARY KEY,
    token_string TEXT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(), 
    CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES "USER"(id) ON DELETE CASCADE
);

CREATE TABLE REQUEST (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
    user_id BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_request_user FOREIGN KEY (user_id) REFERENCES "USER"(id) ON DELETE CASCADE
);

CREATE TABLE ACTIVITY (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    request_id BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(), 
    CONSTRAINT fk_activity_request FOREIGN KEY (request_id) REFERENCES REQUEST(id) ON DELETE CASCADE
);

CREATE TABLE DOCUMENT (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('SOURCE', 'FINAL')),
    request_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_document_request FOREIGN KEY (request_id) REFERENCES REQUEST(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_user FOREIGN KEY (user_id) REFERENCES "USER"(id) ON DELETE CASCADE
);

CREATE TABLE REQUEST_STEP (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    order_index INTEGER NOT NULL,
    token_cost INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_request_step_request FOREIGN KEY (request_id) REFERENCES REQUEST(id) ON DELETE CASCADE,
    CONSTRAINT uq_request_step_order UNIQUE (request_id, order_index)
);

CREATE TABLE SOURCE (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    link TEXT NOT NULL,
    date DATE,
    CONSTRAINT fk_source_document FOREIGN KEY (document_id) REFERENCES DOCUMENT(id) ON DELETE CASCADE
);

-- INDEXES

CREATE INDEX idx_token_user_id ON TOKEN(user_id);
CREATE INDEX idx_request_user_id ON REQUEST(user_id);
CREATE INDEX idx_activity_request_id ON ACTIVITY(request_id);
CREATE INDEX idx_document_request_id ON DOCUMENT(request_id);
CREATE INDEX idx_document_user_id ON DOCUMENT(user_id);
CREATE INDEX idx_request_step_request_id ON REQUEST_STEP(request_id);
CREATE INDEX idx_source_document_id ON SOURCE(document_id);

-- ==========================================
-- POPULATION DES FIXTURES
-- ==========================================

-- Nettoyage
TRUNCATE "USER", TOKEN, REQUEST, ACTIVITY, DOCUMENT, SOURCE, REQUEST_STEP RESTART IDENTITY CASCADE;

-- 1. UTILISATEURS
INSERT INTO "USER" (first_name, last_name, email, password, role, created_at, updated_at) VALUES
    ('Admin', 'System', 'admin@autothesis.com', '$2b$10$YIjlrVyVzMzN5.5Zn5K5Ou5K5Ou5K5Ou5K5Ou5K5Ou', 'ADMIN', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
    ('Jean', 'Dupont', 'jean.dupont@example.com', '$2b$10$YIjlrVyVzMzN5.5Zn5K5Ou5K5Ou5K5Ou5K5Ou5K5Ou', 'USER', NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days'),
    ('Marie', 'Martin', 'marie.martin@example.com', '$2b$10$YIjlrVyVzMzN5.5Zn5K5Ou5K5Ou5K5Ou5K5Ou5K5Ou', 'USER', NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days'),
    ('Pierre', 'Bernard', 'pierre.bernard@example.com', '$2b$10$YIjlrVyVzMzN5.5Zn5K5Ou5K5Ou5K5Ou5K5Ou5K5Ou', 'USER', NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day'),
    ('Sophie', 'Dubois', 'sophie.dubois@example.com', '$2b$10$YIjlrVyVzMzN5.5Zn5K5Ou5K5Ou5K5Ou5K5Ou5K5Ou', 'USER', NOW() - INTERVAL '7 days', NOW()),
    ('Luc', 'Rousseau', 'luc.rousseau@example.com', '$2b$10$YIjlrVyVzMzN5.5Zn5K5Ou5K5Ou5K5Ou5K5Ou5K5Ou', 'USER', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days');

-- 2. TOKENS
INSERT INTO TOKEN (token_string, user_id, created_at) VALUES
    ('token_user_2_' || RANDOM()::TEXT, 2, NOW() - INTERVAL '5 days'),
    ('token_user_3_' || RANDOM()::TEXT, 3, NOW() - INTERVAL '3 days'),
    ('token_user_4_' || RANDOM()::TEXT, 4, NOW() - INTERVAL '1 day');

-- 3. REQUESTS
INSERT INTO REQUEST (name, status, user_id, created_at) VALUES
    ('Mémoire sur l''IA et Machine Learning', 'COMPLETED', 2, NOW() - INTERVAL '20 days'),
    ('Développement Web Full Stack', 'IN_PROGRESS', 3, NOW() - INTERVAL '10 days'),
    ('Analyse des Systèmes Distribués', 'COMPLETED', 4, NOW() - INTERVAL '8 days'),
    ('Blockchain et Cryptomonnaies', 'IN_PROGRESS', 5, NOW() - INTERVAL '5 days'),
    ('Application Mobile React Native', 'COMPLETED', 2, NOW() - INTERVAL '3 days'),
    ('Cloud Computing et DevOps', 'IN_PROGRESS', 6, NOW() - INTERVAL '2 days');

-- 4. ACTIVITIES
INSERT INTO ACTIVITY (name, request_id, created_at) VALUES
    ('Analyse du contenu', 1, NOW() - INTERVAL '19 days'),
    ('Extraction des sources', 1, NOW() - INTERVAL '18 days'),
    ('Génération du plan', 1, NOW() - INTERVAL '17 days'),
    ('Rédaction des sections', 2, NOW() - INTERVAL '9 days'),
    ('Intégration des sources', 2, NOW() - INTERVAL '8 days'),
    ('Review et corrections', 3, NOW() - INTERVAL '7 days'),
    ('Génération finale', 3, NOW() - INTERVAL '6 days'),
    ('Extraction des données', 4, NOW() - INTERVAL '4 days'),
    ('Structuration', 4, NOW() - INTERVAL '3 days'),
    ('Rédaction', 5, NOW() - INTERVAL '2 days'),
    ('Vérification', 5, NOW() - INTERVAL '1 day'),
    ('Upload source', 6, NOW() - INTERVAL '1 day');

-- 5. DOCUMENTS ET SOURCES (Génération Intelligente)
DO $$
DECLARE
    rec_req RECORD;
    clean_name TEXT;
    new_doc_id BIGINT;
    
    -- On déclare une variable de configuration "Clé de recherche" -> "Liste de sources"
    sources_config JSONB := '
    {
        "IA": [
            {"title": "Introduction to Machine Learning", "summary": "Guide complet ML", "link": "https://example.com/ml-intro", "date": "2023-01-15"},
            {"title": "Deep Learning Fundamentals", "summary": "Concepts réseaux neurones", "link": "https://example.com/deep-learning", "date": "2023-06-20"},
            {"title": "AI Ethics and Governance", "summary": "Enjeux éthiques", "link": "https://example.com/ai-ethics", "date": "2024-01-10"}
        ],
        "Web": [
            {"title": "Modern Web Development with React", "summary": "Tutoriel React", "link": "https://example.com/react-guide", "date": "2023-09-15"},
            {"title": "Node.js Best Practices", "summary": "Bonnes pratiques Node", "link": "https://example.com/nodejs", "date": "2023-11-01"}
        ],
        "Systèmes": [
            {"title": "Distributed Systems Design", "summary": "Conception scalable", "link": "https://example.com/distributed-systems", "date": "2023-08-22"},
            {"title": "Microservices Architecture", "summary": "Architecture microservices", "link": "https://example.com/microservices", "date": "2023-12-05"}
        ],
        "Blockchain": [
            {"title": "Blockchain Technology Explained", "summary": "Explication blockchain", "link": "https://example.com/blockchain", "date": "2024-02-01"},
            {"title": "Cryptocurrency Fundamentals", "summary": "Fondamentaux crypto", "link": "https://example.com/crypto", "date": "2024-01-20"}
        ],
        "Mobile": [
            {"title": "React Native Development", "summary": "Guide React Native", "link": "https://example.com/react-native", "date": "2023-10-15"},
            {"title": "Mobile App Performance", "summary": "Optimisation perf", "link": "https://example.com/mobile-perf", "date": "2023-11-30"}
        ],
        "Cloud": [
            {"title": "Cloud Computing Fundamentals", "summary": "Intro Cloud", "link": "https://example.com/cloud-intro", "date": "2023-07-10"},
            {"title": "DevOps Best Practices", "summary": "CI/CD et DevOps", "link": "https://example.com/devops", "date": "2024-01-05"}
        ]
    }';
    
    config_key TEXT;
    source_item JSONB;
BEGIN
    FOR rec_req IN SELECT * FROM REQUEST ORDER BY id LOOP
        
        -- 1. Nettoyage du nom (identique à ton code)
        clean_name := lower(regexp_replace(regexp_replace(rec_req.name, '\s+', '_', 'g'), '[^a-z0-9_]', '', 'g'));

        -- 2. Création Document SOURCE
        INSERT INTO DOCUMENT (name, document_type, request_id, user_id, created_at)
        VALUES (clean_name || '_source.pdf', 'SOURCE', rec_req.id, rec_req.user_id, rec_req.created_at)
        RETURNING id INTO new_doc_id;

        -- 3. Moteur d'insertion dynamique des SOURCES
        -- On parcourt les clés du JSON (IA, Web, Blockchain...)
        FOR config_key IN SELECT jsonb_object_keys(sources_config) LOOP
            
            -- Si le nom de la requête contient la clé (ex: "Mémoire IA" contient "IA")
            IF rec_req.name LIKE '%' || config_key || '%' THEN
                
                -- On boucle sur chaque source définie dans le tableau JSON associé à cette clé
                FOR source_item IN SELECT * FROM jsonb_array_elements(sources_config -> config_key) LOOP
                    INSERT INTO SOURCE (document_id, title, summary, link, date)
                    VALUES (
                        new_doc_id,
                        source_item ->> 'title',
                        source_item ->> 'summary',
                        source_item ->> 'link',
                        (source_item ->> 'date')::DATE
                    );
                END LOOP;
                
                -- Optimisation : On arrête de chercher d'autres clés une fois qu'on a trouvé une correspondance
                EXIT; 
            END IF;
        END LOOP;

        -- 4. Création Document FINAL (si terminé)
        IF rec_req.status = 'COMPLETED' THEN
            INSERT INTO DOCUMENT (name, document_type, request_id, user_id, created_at)
            VALUES (clean_name || '_final.pdf', 'FINAL', rec_req.id, rec_req.user_id, rec_req.created_at + INTERVAL '5 days');
        END IF;

    END LOOP;
    
    RAISE NOTICE '✓ Documents et sources générés via configuration dynamique JSONB.';
END $$;

-- 6. REQUEST STEPS
INSERT INTO REQUEST_STEP (request_id, order_index, token_cost, content, created_at) VALUES
    (1, 1, 150, 'Analyse du contenu et extraction des concepts clés sur l''intelligence artificielle', NOW() - INTERVAL '19 days'),
    (1, 2, 250, 'Identification et structuration des sources académiques et professionnelles', NOW() - INTERVAL '18 days'),
    (1, 3, 300, 'Génération du plan détaillé avec introduction, développement et conclusion', NOW() - INTERVAL '17 days'),
    (1, 4, 400, 'Rédaction complète du mémoire avec analyses approfondies', NOW() - INTERVAL '16 days'),
    
    (2, 1, 200, 'Analyse des frameworks web modernes et des meilleures pratiques', NOW() - INTERVAL '9 days'),
    (2, 2, 280, 'Structuration du contenu pour le full-stack development', NOW() - INTERVAL '8 days'),
    
    (3, 1, 180, 'Analyse des systèmes distribués et architecture microservices', NOW() - INTERVAL '7 days'),
    (3, 2, 320, 'Rédaction détaillée sur les systèmes distribués', NOW() - INTERVAL '6 days'),
    
    (4, 1, 200, 'Exploration de la technologie blockchain', NOW() - INTERVAL '4 days'),
    
    (5, 1, 150, 'Analyse React Native et développement mobile', NOW() - INTERVAL '2 days'),
    (5, 2, 350, 'Rédaction complète du mémoire mobile', NOW() - INTERVAL '1 day'),
    
    (6, 1, 180, 'Analyse du cloud computing et DevOps', NOW() - INTERVAL '1 day');

-- MESSAGES DE CONFIRMATION
DO $$
BEGIN
    RAISE NOTICE '✓ Base de données et fixtures (V2 Robustes) générées avec succès !';
END $$;