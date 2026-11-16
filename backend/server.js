const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. AUTENTICACIÓN Y REGISTRO
// ==========================================
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (user.password === password) {
                res.json({ success: true, user: { id: user.id_usuario, nombre: user.nombre, rol: user.rol } });
            } else {
                res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
            }
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/registro', async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, email, password, rol || 'candidato']
        );
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario (posible email duplicado)' });
    }
});


// ==========================================
// 2. GESTIÓN DE EMPLEOS (VACANTES)
// ==========================================
// Obtener todos los empleos (Buscador y Dashboard Empresa)
app.get('/api/empleos', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM empleos ORDER BY fecha_publicacion DESC");
        res.json(result.rows);
    } catch (error) {
        console.log("ERROR EN LA BD:", error.message); // Agrega esta línea
        res.status(500).json({ error: 'Error al obtener empleos' });
    }
});

app.get('/api/empleos/:id', async (req, res) => {
    const idEmpleo = Number(req.params.id);
    if (!Number.isInteger(idEmpleo) || idEmpleo < 1) {
        return res.status(400).json({ message: 'Identificador de vacante inválido.' });
    }

    try {
        const result = await pool.query('SELECT * FROM empleos WHERE id_empleo = $1', [idEmpleo]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Vacante no encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener detalle de vacante:', error.message);
        res.status(500).json({ message: 'Error al obtener el detalle de la vacante.' });
    }
});

// Crear un nuevo empleo (Empresa publica)
app.post('/api/empleos', async (req, res) => {
    const { empresa_id, titulo, sector, ubicacion, modalidad, experiencia, salario, descripcion, requisitos, beneficios } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO empleos (empresa_id, titulo, sector, ubicacion, modalidad, experiencia, salario, descripcion, requisitos, beneficios, estado) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Aprobado') RETURNING *`,
            [empresa_id, titulo, sector, ubicacion, modalidad, experiencia, salario, descripcion, requisitos, beneficios]
        );
        res.json({ success: true, empleo: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al publicar la vacante' });
    }
});

// Eliminar oferta de empleo (Empresa)
app.delete('/api/empleos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM empleos WHERE id_empleo = $1', [id]);
        res.json({ success: true, message: 'Oferta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la oferta' });
    }
});


// ==========================================
// 3. GESTIÓN DE POSTULACIONES
// ==========================================
// Postularse a un empleo (Candidato)
app.post('/api/postulaciones', async (req, res) => {
    const { empleo_id, usuario_id } = req.body;
    try {
        await pool.query('INSERT INTO postulaciones (empleo_id, usuario_id) VALUES ($1, $2)', [empleo_id, usuario_id]);
        res.json({ success: true, message: 'Postulación enviada correctamente' });
    } catch (error) {
        if (error.code === '23505') { // Violación de clave única en PostgreSQL
            res.status(400).json({ success: false, message: 'Ya aplicaste a este empleo anteriormente.' });
        } else {
            res.status(500).json({ success: false, message: 'Error interno del servidor.' });
        }
    }
});

// Obtener postulaciones de un usuario específico (Dashboard Candidato)
app.get('/api/postulaciones/usuario/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.estado, p.fecha_postulacion, e.titulo, em.razon_social 
            FROM postulaciones p
            JOIN empleos e ON p.empleo_id = e.id_empleo
            JOIN empresas em ON e.empresa_id = em.id_empresa
            WHERE p.usuario_id = $1
            ORDER BY p.fecha_postulacion DESC
        `, [req.params.id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener postulaciones del usuario' });
    }
});

// Obtener todas las postulaciones (Dashboard Empresa)
app.get('/api/postulaciones', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id_postulacion, p.estado, p.fecha_postulacion, u.nombre as candidato_nombre, e.titulo as titulo_empleo
            FROM postulaciones p
            JOIN usuarios u ON p.usuario_id = u.id_usuario
            JOIN empleos e ON p.empleo_id = e.id_empleo
            ORDER BY p.fecha_postulacion DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar aplicantes' });
    }
});

// Aceptar o Denegar aplicante (Empresa)
app.put('/api/postulaciones/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE postulaciones SET estado = $1 WHERE id_postulacion = $2 RETURNING *',
            [estado, id]
        );
        res.json({ success: true, postulacion: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar estado de la postulación' });
    }
});


// ==========================================
// 4. GESTIÓN DE EMPRESAS (PANEL ADMIN)
// ==========================================
// Obtener lista de empresas para auditar
app.get('/api/empresas', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM empresas ORDER BY fecha_registro DESC");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la lista de empresas' });
    }
});

// Cambiar estado de empresa (Admin aprueba o rechaza)
app.put('/api/empresas/:id/estado', async (req, res) => {
    const { estado } = req.body;
    try {
        await pool.query('UPDATE empresas SET estado = $1 WHERE id_empresa = $2', [estado, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar estado' });
    }
});

// ==========================================
// 5. FOROS Y RESPUESTAS
// ==========================================
app.get('/api/foros', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.id_foro, f.categoria, f.titulo, f.descripcion, f.fecha_creacion,
                   u.nombre AS autor, COUNT(r.id_respuesta)::int AS respuestas_count
            FROM foros f
            JOIN usuarios u ON u.id_usuario = f.usuario_id
            LEFT JOIN foro_respuestas r ON r.foro_id = f.id_foro
            GROUP BY f.id_foro, u.nombre
            ORDER BY f.fecha_creacion DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los temas del foro:', error.message);
        res.status(500).json({ message: 'Error al obtener los temas del foro.' });
    }
});

app.get('/api/foros/:id', async (req, res) => {
    const idForo = Number(req.params.id);
    if (!Number.isInteger(idForo) || idForo < 1) {
        return res.status(400).json({ message: 'Identificador de tema inválido.' });
    }

    try {
        const foro = await pool.query(`
            SELECT f.id_foro, f.categoria, f.titulo, f.descripcion, f.fecha_creacion,
                   u.nombre AS autor
            FROM foros f
            JOIN usuarios u ON u.id_usuario = f.usuario_id
            WHERE f.id_foro = $1
        `, [idForo]);
        if (foro.rows.length === 0) {
            return res.status(404).json({ message: 'Tema no encontrado.' });
        }

        const respuestas = await pool.query(`
            SELECT r.id_respuesta, r.mensaje, r.fecha_creacion, u.nombre AS autor, u.rol
            FROM foro_respuestas r
            JOIN usuarios u ON u.id_usuario = r.usuario_id
            WHERE r.foro_id = $1
            ORDER BY r.fecha_creacion ASC
        `, [idForo]);
        res.json({ ...foro.rows[0], respuestas: respuestas.rows });
    } catch (error) {
        console.error('Error al obtener el tema del foro:', error.message);
        res.status(500).json({ message: 'Error al obtener el tema del foro.' });
    }
});

app.post('/api/foros', async (req, res) => {
    const usuarioId = Number(req.body.usuario_id);
    const categoria = typeof req.body.categoria === 'string' ? req.body.categoria.trim() : '';
    const titulo = typeof req.body.titulo === 'string' ? req.body.titulo.trim() : '';
    const descripcion = typeof req.body.descripcion === 'string' ? req.body.descripcion.trim() : '';
    const categoriasPermitidas = [
        'Tecnología y Software',
        'Trabajo Remoto',
        'Salarios y Prestaciones',
        'Primer Empleo'
    ];

    if (!Number.isInteger(usuarioId) || usuarioId < 1 || !categoriasPermitidas.includes(categoria)
        || !titulo || titulo.length > 160 || !descripcion || descripcion.length > 3000) {
        return res.status(400).json({ message: 'Los datos del tema son inválidos.' });
    }

    try {
        const usuario = await pool.query('SELECT id_usuario FROM usuarios WHERE id_usuario = $1', [usuarioId]);
        if (usuario.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        const result = await pool.query(`
            INSERT INTO foros (usuario_id, categoria, titulo, descripcion)
            VALUES ($1, $2, $3, $4)
            RETURNING id_foro, categoria, titulo, descripcion, fecha_creacion
        `, [usuarioId, categoria, titulo, descripcion]);
        res.status(201).json({ success: true, foro: result.rows[0] });
    } catch (error) {
        console.error('Error al crear el tema del foro:', error.message);
        res.status(500).json({ message: 'Error al crear el tema del foro.' });
    }
});

app.post('/api/foros/:id/respuestas', async (req, res) => {
    const idForo = Number(req.params.id);
    const usuarioId = Number(req.body.usuario_id);
    const mensaje = typeof req.body.mensaje === 'string' ? req.body.mensaje.trim() : '';
    if (!Number.isInteger(idForo) || idForo < 1 || !Number.isInteger(usuarioId) || usuarioId < 1
        || !mensaje || mensaje.length > 3000) {
        return res.status(400).json({ message: 'Los datos de la respuesta son inválidos.' });
    }

    try {
        const usuario = await pool.query('SELECT id_usuario FROM usuarios WHERE id_usuario = $1', [usuarioId]);
        if (usuario.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        const tema = await pool.query('SELECT id_foro FROM foros WHERE id_foro = $1', [idForo]);
        if (tema.rows.length === 0) {
            return res.status(404).json({ message: 'Tema no encontrado.' });
        }
        const result = await pool.query(`
            INSERT INTO foro_respuestas (foro_id, usuario_id, mensaje)
            VALUES ($1, $2, $3)
            RETURNING id_respuesta, mensaje, fecha_creacion
        `, [idForo, usuarioId, mensaje]);
        res.status(201).json({ success: true, respuesta: result.rows[0] });
    } catch (error) {
        console.error('Error al crear la respuesta del foro:', error.message);
        res.status(500).json({ message: 'Error al crear la respuesta del foro.' });
    }
});


// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servidor de Zion Empleos corriendo en http://localhost:${PORT}`);
});