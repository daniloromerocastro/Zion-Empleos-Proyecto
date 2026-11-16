CREATE TABLE IF NOT EXISTS foros (
    id_foro SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    categoria VARCHAR(80) NOT NULL,
    titulo VARCHAR(160) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS foro_respuestas (
    id_respuesta SERIAL PRIMARY KEY,
    foro_id INTEGER NOT NULL REFERENCES foros(id_foro) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    mensaje VARCHAR(3000) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_foros_fecha_creacion
    ON foros (fecha_creacion DESC);

CREATE INDEX IF NOT EXISTS idx_foro_respuestas_foro_fecha
    ON foro_respuestas (foro_id, fecha_creacion);
