# ContratosExpress.pro

Generador de contratos y acuerdos profesionales con IA. 8 tipos de contrato, bilingüe ES/EN, modo online (Groq AI) y offline (plantillas). Con subida de logo opcional para la cabecera del documento.

**Desarrollado por [MolvicStudios](https://molvicstudios.com/)**

---

## Características

- **8 tipos de contrato**: Servicios, NDA, Freelance, Arrendamiento, Laboral, Sociedad, Compraventa, Personalizado
- **Modo Online**: Groq AI (Llama 3.3 70B) — contrato único generado con IA
- **Modo Offline**: 8 plantillas profesionales — 100% en el navegador, sin red
- **Bilingüe**: Español e inglés, conmutable en tiempo real
- **Logo opcional**: Sube tu logo (PNG/JPG/SVG/WebP, máx. 2MB) para que aparezca en la cabecera del documento
- **Vista previa en tiempo real** mientras rellenas el formulario
- **Cláusulas a medida**: Confidencialidad, No competencia, PI, Resolución de disputas, Terminación anticipada, Fuerza mayor, Protección de datos
- **4 variantes** por contrato: Más protector, Equilibrado, Simple, Cláusula penal
- **Historial** (últimos 10) y **Favoritos** guardados en localStorage
- **Autoguardado** de borradores del formulario
- **GDPR-compliant**: Sin registro, sin backend propio, Política de Privacidad y Cookies incluidas
- 100% estático — desplegable en Cloudflare Pages, Netlify, GitHub Pages

---

## Estructura de archivos

```
contratosexpress/
├── index.html          # Aplicación principal
├── privacy.html        # Política de privacidad (ES/EN)
├── cookies.html        # Política de cookies (ES/EN, tabla completa)
├── README.md
├── css/
│   └── styles.css      # Design system completo (Dark Editorial + Amber)
└── js/
    ├── translations.js  # Todas las cadenas de texto ES y EN
    ├── templates.js     # 8 plantillas de contrato + variantes + prompts Groq
    └── app.js           # Lógica completa de la aplicación
```

---

## Requisitos

- Ninguno para el modo offline (`python3 -m http.server` es suficiente)
- Para el modo online: API Key gratuita de [Groq](https://console.groq.com/keys)

---

## Ejecutar en local

```bash
cd /ruta/a/contratosexpress
python3 -m http.server 8080
```

Abre `http://localhost:8080` en tu navegador.

> **Nota**: No abras `index.html` directamente como archivo local (`file://`), ya que los módulos ES6 requieren un servidor HTTP.

---

## Configuración del modo Online (Groq AI)

1. Ve a [console.groq.com/keys](https://console.groq.com/keys) y crea una cuenta gratuita
2. Genera una API Key (empieza con `gsk_`)
3. En la herramienta, selecciona **Modo Online — Groq AI**
4. Pega tu API Key en el campo correspondiente
5. Tu key se guarda en `sessionStorage` (se borra al cerrar la pestaña) y se envía **directamente** a `api.groq.com` — nunca pasa por nuestros servidores

**Modelo utilizado**: `llama-3.3-70b-versatile`

---

## Feature: Subida de Logo

Al final del paso 4 del formulario (Cláusulas y Opciones) encontrarás la sección de logo:

- **Arrastra** una imagen o haz clic para seleccionarla (PNG, JPG, SVG, WebP — máx. 2 MB)
- **Sin logo**: selecciona la opción "Sin logo — solo texto" (seleccionada por defecto)
- El logo aparece en la **cabecera de la vista previa** y en el **documento generado**
- El logo se almacena solo en memoria (no en localStorage) y se descarta al generar un nuevo contrato

---

## Despliegue en Cloudflare Pages

1. Sube el código a un repositorio de GitHub
2. En [dash.cloudflare.com](https://dash.cloudflare.com/), crea un nuevo proyecto de Pages
3. Conecta el repositorio
4. **No se requiere ningún build step** — branch: `main`, build command: (vacío), output dir: `/`
5. Cloudflare Pages despliega automáticamente en cada push

---

## Tecnologías

| Tecnología | Uso |
|-----------|-----|
| HTML5 + CSS puro | Interfaz de usuario |
| JavaScript ES Modules | Lógica de la aplicación (sin bundler) |
| [Syne](https://fonts.google.com/specimen/Syne) | Fuente de display |
| [DM Sans](https://fonts.google.com/specimen/DM+Sans) | Fuente de cuerpo |
| [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | Fuente monoespaciada (contratos) |
| [Groq API](https://groq.com/) | IA online — Llama 3.3 70B |
| localStorage / sessionStorage | Persistencia local |
| FileReader API | Procesamiento del logo |
| Cloudflare Pages | Hosting estático |

---

## Tipos de contrato incluidos

| ID | Título ES | Título EN |
|----|-----------|-----------|
| `services` | Contrato de Prestación de Servicios | Service Agreement |
| `nda` | Acuerdo de Confidencialidad (NDA) | Non-Disclosure Agreement |
| `freelance` | Contrato Freelance | Freelance Contract |
| `rental` | Contrato de Arrendamiento | Rental Agreement |
| `employment` | Contrato Laboral | Employment Contract |
| `partnership` | Acuerdo de Sociedad o Colaboración | Partnership Agreement |
| `sales` | Contrato de Compraventa | Sales Contract |
| `custom` | Contrato Personalizado | Custom Contract |

---

## Cláusulas opcionales disponibles

- Confidencialidad (NDA integrado)
- No Competencia (con duración personalizable)
- Propiedad Intelectual
- Resolución de Disputas
- Terminación Anticipada (con plazo de preaviso personalizable)
- Fuerza Mayor
- Protección de Datos Personales

---

## Variables de CSS principales

El diseño usa un sistema de tokens en `css/styles.css`:

```css
--bg-deep:     #08080a   /* Fondo principal */
--bg-surface:  #111115   /* Superficie de tarjetas */
--bg-elevated: #1a1a1f   /* Elementos elevados */
--amber:       #f5a623   /* Color de acento principal */
--amber-light: #fbbf3a
--text-primary: #f0f0f4
--text-secondary: #a0a0b0
--radius-md:   12px
--space-lg:    32px
```

---

## Aviso legal

Los contratos generados son **plantillas orientativas**. No constituyen asesoramiento legal profesional. Para contratos vinculantes, consulta siempre con un abogado colegiado en tu jurisdicción.

---

## Licencia

© 2025 MolvicStudios. Todos los derechos reservados.

Este proyecto no tiene licencia de código abierto. Está desarrollado para uso en [ContratosExpress.pro](https://contratosexpress.pro/).
