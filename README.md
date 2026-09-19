# CERT Forms Center

Centro de formularios digitales del CERT — single-page app (vanilla JS, sin build step), alojada en GitHub Pages, con Firebase (Firestore + Storage + Auth opcional).

## Qué hace

- **PIN gate** (SHA-256 en `crypto.subtle`, 6 dígitos) + auto-bloqueo a los 10 min de inactividad y al ocultar la pestaña.
- **Modos**: Quiosco (nombre libre, por defecto Giulia) o Personal (Firebase Auth email/password).
- **Incidentes**: crear y listar; tablero por incidente con listeners en vivo (`teams`, `submissions`, `scans`).
- **Plantillas genéricas**: las 8 plantillas XML en `forms/` se renderizan con un renderer genérico (nunca hardcodea un formulario). Carga desde el bucket de Storage con fallback al repo, cache en localStorage.
- **Firmas**: pad de firma en canvas → PNG reducido (<1MB) guardado en el documento.
- **Escaneos**: subida a Storage `forms/scans/...` + documento en `scans`.
- **Auditoría**: cada escritura agrega un doc en `audit` con actor/acción/colección/docId.
- **Offline**: cola en localStorage que se sincroniza al volver la conexión; service worker cachea el app shell + plantillas.
- **Demo en vivo**: vista DEMO con listeners en vivo (filtro `demo==true`) + simulador que escribe actividad demo cada ~25 s. Las vistas reales excluyen docs demo.
- **Impresión**: stylesheet `@media print` para formularios limpios.
- **ES primero** con toggle EN.

## Estructura

```
index.html  styles.css  app.js  sw.js
forms/      damage_assessment.xml, personnel_signin.xml, assignment_tracking.xml,
            briefing_assignment.xml, victim_treatment_record.xml,
            communications_log.xml, equipment_inventory.xml, general_message.xml,
            manifest.json
```

## Firestore (colecciones)

`incidents` (con subcolección `teams`), `submissions`, `scans`, `audit`.
Docs reales llevan `demo:false`; la demo usa `demo:true` y el incidente `demo-2026-09-20`.

Live: https://legobele.github.io/cert-forms-center/
