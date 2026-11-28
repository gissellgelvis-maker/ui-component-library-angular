# Bitácora de desarrollo

Prueba técnica **UI Component Library: Angular + TypeScript**. Este documento registra cómo se construyó el proyecto: el proceso, las decisiones, los retos encontrados y el uso de herramientas de IA.

**Herramientas de IA utilizadas:** Claude (asistente principal durante todo el proyecto), Gemini (propuestas de color para los botones) y ChatGPT (ideas de estilos para la app). El detalle de cada uso está en la [sección 4](#4-uso-de-herramientas-de-ia).

## Tabla de contenido

1. [Proceso de trabajo](#1-proceso-de-trabajo)
2. [Decisiones técnicas](#2-decisiones-técnicas)
3. [Retos y soluciones](#3-retos-y-soluciones)
4. [Uso de herramientas de IA](#4-uso-de-herramientas-de-ia)

## 1. Proceso de trabajo

El trabajo se hizo con **una rama por pieza de trabajo** y un Pull Request hacia `main` por cada una, con **Conventional Commits**. Antes de cada merge se revisó la pestaña *Files changed* para confirmar que no se colaran `node_modules`, `dist` ni archivos ajenos al cambio.

| PR | Rama | Contenido |
|---|---|---|
| #1 | `chore/setup-projects` | Workspace Angular, proyectos `ui-lib` (prefijo `ui`) y `demo-app`, Tailwind v3 y `strict: true` |
| #2 | `feat/ui-button` | `ui-button`: variantes, tamaños, `disabled` y `loading` |
| #3 | `feat/ui-card` | `ui-card` con contenido proyectado (`ng-content`) |
| #4 | `feat/ui-select` | `ui-select` con `model()`; corrección del `index.html` de la demo |
| #5 | `feat/ui-table` | `ui-table` genérica con skeleton, estado vacío y error |
| #6 | `feat/resource-models` | Interfaces `Character`, `Episode`, `Location` y `ApiResponse<T>` |
| #7 | `feat/resource-service` | `ResourceExplorerService` con signals y llamadas HTTP |
| #8 | `feat/explorer-flow` | Explorador: selects, tabla, modal de detalle con `ui-card` y modal reutilizable |
| #9 | `feat/explorer-flow` (rama reutilizada) | `rootDir` en `tsconfig.spec.json` y specs de `ui-card` y `ui-table` |
| #10 | `feat/delete-confirmation` | Confirmación antes de eliminar y `removeRow` en el servicio |
| #11 | `feat/rick-morty-theme` | Tema Rick & Morty, tokens semánticos y `appearance` del botón |
| #12 | `test/fix-demo-specs` | Specs de la demo corregidos |
| #13 | `refactor/explicit-standalone` | `standalone: true` explícito en todos los componentes |
| n/a | `docs/readme` | README principal, README de la librería y bitácora de desarrollo |

Estado de las pruebas al momento de escribir esta bitácora: `ui-lib` 4 de 4 y `demo-app` 6 de 6 en verde.

## 2. Decisiones técnicas

El detalle y la justificación de cada una están en la sección *Decisiones de diseño* del [README](./README.md). Las principales:

- **Librería agnóstica del dominio:** `ui-table` es genérica; los modelos de la API viven solo en la demo.
- **Estado y HTTP en un servicio con signals:** los componentes no hacen llamadas HTTP.
- **Colores semánticos (tokens de Tailwind)** en lugar de colores fijos dentro de la librería.
- **`appearance` separado de `variant`**, para no alterar el tipo `'primary' | 'secondary' | 'danger'` que define la prueba.
- **Filtro de status solo para Characters**, porque es lo único que soporta la API; fuera de ahí el select se deshabilita.
- **La API responde 404 cuando no hay resultados:** se trata como estado vacío, no como error.
- **Cada petición cancela la anterior**, para evitar que una respuesta lenta pise datos más recientes.
- **La tabla solo emite acciones** y el componente padre decide qué hacer con ellas.
- **La demo lee la librería desde `dist/`**, como lo haría con una librería publicada.

## 3. Retos y soluciones

### 3.1 La demo mostraba "select works!" aunque el componente estaba bien escrito
- **Causa:** la demo no lee el código de `ui-lib`, sino la copia compilada en `dist/ui-lib` (por `paths` en `tsconfig.json`). Se había editado `select.html` sin recompilar.
- **Solución:** ejecutar `ng build ui-lib` cada vez que cambia la librería, o dejar `ng build ui-lib --watch --configuration development` en una terminal. Quedó documentado en el README.

### 3.2 Caracteres sobrantes en `index.html` (`<<!doctype html>`)
- **Síntoma:** aparecían un `<` y un `>` sueltos en la página y la terminal mostraba un error de `parse5`.
- **Causa:** caracteres sobrantes al editar el archivo a mano. La primera hipótesis fue que venían de `app.html`, pero el mensaje de error apuntaba a `index.html`.
- **Solución:** se corrigió la primera línea y se eliminó el carácter final. Se subió con el commit `fix: remove stray characters from demo-app index.html` (incluido en el PR #4).

### 3.3 `'ui-button' is not a known element` / `'app-confirm-dialog' is not a known element`
- **Causa:** en componentes standalone, cada componente usado en la plantilla debe estar en el arreglo `imports` del componente que lo usa, además del `import` de TypeScript. Pasó con `Button` y `Card` en la demo, y con `ConfirmDialog` en el explorador.
- **Solución:** agregarlos al `imports` del componente correspondiente.

### 3.4 `providers` duplicado en `app.config.ts`
- **Síntoma:** errores `Duplicate key "providers"` y de tipos al activar `HttpClient`.
- **Causa:** se agregó una segunda propiedad `providers` en lugar de añadir `provideHttpClient()` al arreglo existente.
- **Solución:** un único arreglo `providers` con `provideBrowserGlobalErrorListeners()` y `provideHttpClient()`.

### 3.5 El tipado de columnas no admitía una unión de tipos
- **Causa:** `TableColumn<T>` tipaba `key` como `keyof T`. Con `T = Character | Episode | Location`, `keyof` solo conserva las claves comunes (`id`, `name`, `url`, `created`), por lo que columnas como `status` o `air_date` no compilaban.
- **Solución:** `KeysOfUnion<T>` (tipo condicional distributivo) y un cast controlado a `Record<string, unknown>` al leer la celda. Con un tipo normal sigue siendo estricto: una clave inexistente falla al compilar. Se comprobó con el compilador de TypeScript antes de aplicarlo.

### 3.6 Particularidades de la Rick and Morty API

- **El filtro `status` solo existe para personajes** (Episodes filtra por `name` y `episode`; Locations por `name`, `type` y `dimension`). Se deshabilita el select de filtro fuera de Characters y se reinicia en el servicio al cambiar de recurso.
- **Sin resultados responde 404.** Cuando la API no encuentra coincidencias, responde con un código HTTP 404. El servicio interpreta esta respuesta como un estado vacío: limpia las filas y no muestra un mensaje de error. Los errores reales (sin conexión, 5xx) muestran el mensaje de error correspondiente.
- **Condición de carrera:** un cambio rápido de recurso podía dejar que la respuesta lenta del recurso anterior pisara los datos nuevos. Para evitarlo, se cancela la petición anterior con `unsubscribe()` antes de iniciar una nueva.

### 3.7 Specs generados que fallaban
- **Causa:** los tests por defecto de Angular no conocen los inputs obligatorios (`title` en `ui-card`, `title` y `message` en `ConfirmDialog`, `item` en `DetailModal`), la tabla genérica ni el `HttpClient`; y `app.spec.ts` buscaba el texto de bienvenida de la plantilla.
- **Solución:** `fixture.componentRef.setInput(...)` antes de detectar cambios, una interfaz `TestRow` para `Table<TestRow>`, `provideHttpClient()` más `provideHttpClientTesting()`, y un test que comprueba que la app renderiza `app-explorer`.

### 3.8 TypeScript 6 exige `rootDir`
- **Síntoma:** error en `tsconfig.spec.json` de `ui-lib`: *"The common source directory ... The 'rootDir' setting must be explicitly set"*.
- **Solución:** agregar `"rootDir": "./"` en `compilerOptions`.

### 3.9 Propiedad `classes` duplicada en `button.ts`
- **Causa:** al agregar `appearance`, se añadió la nueva versión del `computed` `classes` sin borrar la anterior.
- **Solución:** conservar una sola `classes` que elige la paleta según `appearance`.

### 3.10 Reemplazo masivo de colores que afectó a más archivos de los previstos
- **Qué pasó:** para pasar de colores fijos a tokens se aplicó un comando `sed` a **todos** los `.ts` y `.html` del proyecto, y no solo a los que tenían colores. En Windows eso pudo cambiar los finales de línea (CRLF por LF) de archivos que no se debían tocar, y el estilo de los botones se perdió temporalmente.
- **Cómo se detectó:** `git status` mostraba archivos modificados que no tenían ningún color de Tailwind (`main.ts`, `app.config.ts`, `public-api.ts`...).
- **Solución:** se restauraron los archivos sin cambios reales, se corrigió a mano el estilo de los botones y se verificó el PR comparando contra `main` con `git diff --stat` y `--ignore-cr-at-eol`: quedó en 11 archivos con cambios pequeños.
- **Aprendizaje:** limitar los reemplazos masivos a los archivos que contienen el patrón y revisar `git diff --stat` antes de commitear.

### 3.11 Errores tipográficos en mensajes de commit
- **Qué pasó:** dos commits ya mergeados a `main` quedaron con errores (`implement ui-table winth skeloton loanding state` y `vi-table` en lugar de `ui-table`). Otro (`fead:` en lugar de `feat:`) se corrigió con `git commit --amend` antes del merge.
- **Decisión:** los dos ya mergeados se dejaron como están, porque corregirlos obligaría a reescribir la historia de `main`. Desde entonces se relee el mensaje antes de cada commit.

### 3.12 Contraste insuficiente en la propuesta de colores de los botones
- **Qué pasó:** la propuesta generada con Gemini tenía botones muy apagados. Al medir los colores de la imagen, el texto de **Ver** tenía un contraste de 3.1:1 y el de **Eliminar** de 1.8:1 (el mínimo recomendado, WCAG AA, es 4.5:1). Además, se confundían con el estado `disabled`, si el texto es grande, el criterio puede ser diferente.
- **Solución:** se conservó la idea (botones outline) con colores más claros, de 12.3:1 y 10.1:1. Ver el detalle en la sección 4.

## 4. Uso de herramientas de IA

### 4.1 Claude: planificación y arranque del workspace
- **Prompt utilizado**  Se proporcionó el documento PDF de la prueba técnica y se solicitó orientación para desarrollar el proyecto desde cero, incluyendo la planificación de las tareas y la configuración inicial del entorno de trabajo. Posteriormente, se indicó que el desarrollo se realizaría mediante ramas de Git para organizar los cambios.
- **Se aceptó:** Se tomó como referencia la propuesta de dividir el desarrollo en etapas, organizar el trabajo mediante ramas y Pull Requests (PR), y ejecutar los comandos necesarios para configurar el workspace de Angular, crear la librería de componentes y generar la aplicación de demostración. Esto permitió establecer una estructura de trabajo ordenada y facilitar la revisión de los cambios.
- **Se rechazó o modificó:** se usó Tailwind v3 (no v4), como exige la prueba, y se activó `strict: true` de forma explícita en el `tsconfig.json`.

### 4.2 Claude: componentes `ui-button`, `ui-card`, `ui-select` y `ui-table`
- **Prompt:** tras generar cada componente con `ng generate component`, se pidió el código del componente con los inputs y outputs de la prueba.
- **Se aceptó:** la API de signals (`input()`, `output()`, `model()`), `computed` para las clases, mapas `Record` con clases completas de Tailwind (para que se generen), `input.required` y el header de la card como `<button>`, el `<select>` nativo con `[selected]` por opción, y la tabla genérica con `format` opcional y prioridad de estados (loading, error, vacío, datos).
- **Se rechazó o modificó:**
  - Claude propuso separar en dos commits la eliminación del componente de ejemplo y el botón; luego advirtió que el commit intermedio dejaría `public-api.ts` apuntando a un archivo inexistente, y se hizo un solo commit.
  - En el spec de la tabla se sugirió `Table<object>`; se usó una interfaz `TestRow`, más cercana a un caso real.
  - Los problemas de ejecución (3.1, 3.3) se resolvieron revisando los errores de la terminal, no cambiando el código sugerido.

### 4.3 Claude: modelos, servicio con signals y verificación de la API
- **Prompt:** se pidió el servicio con signals que cumpliera el requisito de no hacer HTTP en los componentes. Claude consultó la documentación de la API para comprobar qué filtros admite cada recurso.
- **Se aceptó:** el servicio con signals privadas y públicas de solo lectura, la cancelación de la petición anterior, tratar el 404 como vacío y deshabilitar el filtro fuera de Characters.
- **Se rechazó o modificó:** al registrar `provideHttpClient()` se había duplicado la propiedad `providers` (ver 3.4); se unificó en un solo arreglo.

### 4.4 Claude: flujo del explorador, modales y confirmación de eliminar
- **Prompt:** se pidió armar el flujo completo (dos selects, tabla, modal de detalle con `ui-card`) y después la confirmación antes de eliminar.
- **Se aceptó:** el modal reutilizable (`app-modal`), el detalle con contenido proyectado según el tipo de recurso, `resource-config` con guardas de tipo en lugar de casts, el botón "Limpiar filtro" y `removeRow` en el servicio.
- **Se rechazó o modificó:** antes de aplicar el flujo, Claude detectó que `keyof T` no admitía una unión de tipos y propuso `KeysOfUnion`, comprobado con el compilador (3.5). Al integrar, hubo que reemplazar el `app.html` de bienvenida por `<app-explorer />` y agregar `ConfirmDialog` al `imports` (3.3).

### 4.5 Claude: tema visual a partir de una referencia
- **Prompt:** se compartió una captura de un sitio de Rick and Morty como referencia ("me gusta esta paleta de colores"). Claude midió los colores de la imagen con un script y propuso tokens semánticos.
- **Se aceptó:** la paleta medida (`#000000`, `#0f0f0f`, `#4fa4ab`, `#51cf43`, `#c3f8a6`), los tokens de Tailwind, el fondo de estrellas solo con CSS, el hover teal y la animación `fade-in` con `motion-safe`.
- **Se rechazó o modificó:** no se usó el logo de la referencia (tiene derechos de autor; la prueba no lo exige). La tipografía (Patrick Hand) es parecida pero no idéntica a la de la referencia. El reemplazo masivo de colores salió mal (3.10) y se corrigió.

### 4.6 Gemini: propuesta de colores para los botones
- **Prompt:** Necesito que me des tres propuestas de colores para mis botones ya que los colores q tienen actualmente llaman mucho la atencion.
- **Resultado:** una imagen del Explorer con los botones **Ver** y **Eliminar** en estilo outline, de colores muy apagados.
- **Se aceptó:** la idea de usar botones con borde y fondo transparente en la tabla, para reducir el ruido visual de los botones rojos repetidos en cada fila.
- **Se rechazó o modificó:** los colores de la propuesta. Medidos, el texto tenía contraste de 3.1:1 (Ver) y 1.8:1 (Eliminar), por debajo del mínimo recomendado de 4.5:1, y los botones parecían deshabilitados. Se reemplazaron por texto claro (`#9fd9de` y `#fca5a5`, de 12.3:1 y 10.1:1), con relleno en hover. Además, en vez de añadir una cuarta variante (la prueba fija tres), se agregó un input independiente `appearance` (`solid` | `outline`); el botón de confirmar eliminación sigue siendo rojo sólido.

### 4.7 Claude: revisión del código, pruebas y documentación
- **Prompt:** se subió el proyecto comprimido varias veces pidiendo una revisión ("quiero que veas el archivo como está actualmente y me des propuestas de mejora", "que tal ves el proyecto?").
- **Se aceptó:** corregir los specs que fallaban y el `rootDir` (3.7, 3.8), declarar `standalone: true` de forma explícita y `OnPush` en `App`, corregir `lang`/`charset` en `index.html`, y redactar el README con la tabla de API verificada contra el código.
- **Se rechazó o modificó:**
  - Una observación sobre `soft` en el ejemplo de `tailwind.config.js` se verificó contra el archivo: el token sí estaba. Se amplió el ejemplo para incluir también la fuente y la animación.
  - El README de la librería tenía el evento `selectionChange` bajo `ui-button`, no incluía `ui-card` y tenía el código fuera de bloques; se reemplazó por la versión corregida.
  - Se ajustaron encabezados de Markdown mal escritos y se amplió el README con secciones propias (requisitos, "Qué deberías ver" y el diagrama de flujo).

### 4.8 ChatGPT: ideas de estilos para la app
- **Prompt:** Se solicitó ayuda para definir una propuesta visual para la aplicación demo, tomando como referencia la temática de Rick and Morty. El objetivo era conseguir una interfaz atractiva, coherente con la temática y que mantuviera una buena experiencia de usuario.
- **Se aceptó:** Se adoptó la idea de utilizar una temática visual inspirada en Rick and Morty, una paleta de colores acorde con ella y una tipografía que acompañara el estilo de la interfaz. Estas ideas sirvieron como referencia para desarrollar el diseño del Explorer.
- **Se rechazó o modificó:** Se decidió no utilizar logos ni imágenes protegidas por derechos de autor. Además, la paleta de colores se implementó mediante tokens semánticos de Tailwind CSS, manteniendo los componentes de ui-lib independientes de los estilos particulares de la aplicación demo. La implementación final se ajustó a las necesidades del proyecto.

