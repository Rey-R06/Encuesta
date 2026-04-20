import { useState } from "react";

const SHEET_URL = "https://script.google.com/macros/s/AKfycbxyZ5o1pO_t-mBcARtulKNqlmqXN93ffcpEe2b5cguTIOzXMtVb7EjJE8eaAfdO-HU/exec";

const preguntas = [
  { id: "color",    label: "¿Cuál es tu color favorito?" },
  { id: "cantante", label: "¿Cuál es tu cantante favorito?" },
  { id: "comida",   label: "¿Cuál es tu comida favorita?" },
  { id: "pelicula", label: "¿Cuál es tu película favorita?" },
  { id: "deporte",  label: "¿Cuál es tu deporte favorito?" },
];

export default function Formulario() {
  const [respuestas, setRespuestas] = useState({});
  const [estado, setEstado] = useState("idle"); // idle | enviando | exito | error

  const respondidas = preguntas.filter(p => respuestas[p.id]?.trim()).length;
  const progreso = (respondidas / preguntas.length) * 100;
  const listo = respondidas === preguntas.length;

  const handleChange = (id, valor) => {
    setRespuestas(prev => ({ ...prev, [id]: valor }));
  };

  const handleSubmit = async () => {
  setEstado("enviando");
  const data = {
    fecha: new Date().toLocaleString("es-CO"),
    ...Object.fromEntries(preguntas.map(p => [p.id, respuestas[p.id] ?? ""])),
  };

  try {
    const params = new URLSearchParams(data).toString();
    await fetch(`${SHEET_URL}?${params}`, {
      method: "GET",
      mode: "no-cors",
    });
    setEstado("exito");
  } catch {
    setEstado("error");
  }
};

  if (estado === "exito") {
    return (
      <div className="wrap">
        <div className="success-box">
          <div className="check-icon">✓</div>
          <h2>¡Gracias por responder!</h2>
          <p>Tus respuestas fueron guardadas en Google Sheets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="header">
        <h1>Encuesta de preferencias</h1>
        <p>Escribe tu respuesta en cada campo</p>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progreso}%` }} />
      </div>
      <p className="counter">{respondidas} de {preguntas.length} respondidas</p>

      {preguntas.map((p, i) => (
        <div key={p.id} className="card">
          <div className="q-row">
            <span className="q-num">{i + 1}</span>
            <span className="q-label">{p.label}</span>
          </div>
          <textarea
            className="q-input"
            rows={2}
            maxLength={200}
            placeholder="Escribe tu respuesta aquí..."
            value={respuestas[p.id] ?? ""}
            onChange={e => handleChange(p.id, e.target.value)}
          />
          <p className="char-count">{(respuestas[p.id] ?? "").length}/200</p>
        </div>
      ))}

      <button className="submit-btn" disabled={!listo || estado === "enviando"} onClick={handleSubmit}>
        {estado === "enviando" ? "Enviando..." : "Enviar respuestas"}
      </button>
      {estado === "error" && <p className="error-msg">Error al enviar. Verifica la URL del script.</p>}
    </div>
  );
}