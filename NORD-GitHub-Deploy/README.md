# NORD — Drop 006

Landing page interactiva 3D de NORD, lista para GitHub Pages.

## Publicar en GitHub Pages

1. Sube todo el contenido de esta carpeta a la rama `main` de tu repositorio.
2. En GitHub abre **Settings → Pages**.
3. En **Build and deployment → Source**, selecciona **GitHub Actions**.
4. Haz push a `main` o ejecuta manualmente el workflow **Deploy NORD to GitHub Pages** desde la pestaña **Actions**.
5. Al terminar el workflow, GitHub mostrará la URL pública del sitio.

## Formulario de apartado

La landing contiene `window.NORD_ORDER_CONFIG` dentro de `index.html`.

Configura **una** opción antes de lanzamiento:

```js
window.NORD_ORDER_CONFIG = Object.assign({
  endpoint: '',
  whatsapp: '',
  email: ''
}, window.NORD_ORDER_CONFIG || {});
```

- `endpoint`: URL HTTPS que reciba JSON por POST.
- `whatsapp`: número internacional solo con dígitos, sin `+`.
- `email`: dirección que abrirá el cliente de correo del visitante.

No es necesario instalar Node, npm ni dependencias. Los recursos visuales y Three.js están embebidos en `index.html`.
