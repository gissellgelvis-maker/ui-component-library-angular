# UI Component Library: Angular + TypeScript

Librería propia de componentes Angular (ui-lib) y aplicación demo (demo-app) que la consume para explorar la Rick and Morty API.

Proyecto desarrollado como parte de una prueba técnica para el cargo de Aprendiz / Practicante de Desarrollo Frontend.

- **Repositorio:** https://github.com/gissellgelvis-maker/ui-component-library-angular
- **Bitácora de desarrollo:** [`DEVELOPMENT_LOG.md`](./DEVELOPMENT_LOG.md)


## Tabla de contenido

1. [Tecnologías](#tecnologías)
2. [Arquitectura](#arquitectura)
3. [Instalación y ejecución](#instalación-y-ejecución)
4. [Qué deberías ver](#qué-deberías-ver)
5. [API de los componentes](#api-de-los-componentes)
6. [Tema y tokens de Tailwind](#tema-y-tokens-de-tailwind)
7. [Demo app: Explorer](#demo-app-explorer)
8. [Decisiones de diseño](#decisiones-de-diseño)
9. [Pruebas](#pruebas)
10. [Convenciones y flujo de trabajo](#convenciones-y-flujo-de-trabajo)
11. [Limitaciones conocidas](#limitaciones-conocidas)

## Tecnologías

| Tecnología       | Versión     | Uso                                                                  |
|------------------|-------------|----------------------------------------------------------------------|
| Angular          | 22.3        | Framework principal para la librería de componentes y la app demo.   |
| TypeScript       | 6.0         | Lenguaje utilizado para implementar la lógica y los componentes.     |
| Tailwind CSS     | 3.4         | Estilos y diseño responsive de la aplicación.                        |
| Vitest           | 5           | Ejecución de pruebas unitarias de la librería y la aplicación.       |
| Rick and Morty API | API externa | Fuente de datos para mostrar personajes y recursos en la demo.      |

No se usa ninguna librería de componentes externa (Angular Material, PrimeNG, NgBootstrap, etc.): todos los componentes están escritos desde cero con Tailwind.

## Arquitectura

Es un **Angular workspace** con dos proyectos:

```
my-workspace/
├── projects/
│   ├── ui-lib/                      ← Librería de componentes (prefijo `ui`)
│   │   └── src/
│   │       ├── public-api.ts        ← API pública: todo lo exportado sale de aquí
│   │       └── lib/components/
│   │           ├── button/          ← <ui-button>
│   │           ├── card/            ← <ui-card>
│   │           ├── select/          ← <ui-select>
│   │           └── table/           ← <ui-table>
│   └── demo-app/                    ← App que consume la librería (prefijo `app`)
│       └── src/app/
│           ├── explorer/            ← Pantalla principal + modal de detalle + confirmación
│           ├── models/              ← Character, Episode, Location, ApiResponse...
│           ├── services/            ← ResourceExplorerService (estado con signals + HTTP)
│           └── shared/modal/        ← Contenedor modal reutilizable
├── tailwind.config.js               ← Tokens de la paleta (compartidos por ambos proyectos)
├── angular.json
└── package.json
```

### Reglas de la arquitectura

- **La librería no conoce el dominio.** `ui-table` es genérica (`Table<T>`): solo renderiza columnas y emite acciones. Los modelos `Character`, `Episode` y `Location` viven únicamente en la demo.
- **La demo solo importa desde `'ui-lib'`**, nunca por rutas internas. Dentro de la librería, los componentes se importan entre sí con rutas relativas.
- **Los componentes no hacen llamadas HTTP.** Todo el estado del flujo (recurso activo, filtro, filas, loading y error) vive en `ResourceExplorerService`, con signals. Los componentes leen esas signals y llaman a sus métodos.
- **Todos los componentes** son `standalone`, usan `ChangeDetectionStrategy.OnPush` y la API de signals (`input()`, `output()`, `model()`). No se usan los decoradores `@Input()` / `@Output()`.

### Flujo de datos de la demo

Carga inicial: Explorer ejecuta load() al inicializarse y solicita los primeros 20 registros de Characters.

Consulta de datos: ResourceExplorerService realiza las peticiones HTTP a Rick and Morty API y actualiza los Signals correspondientes.

Visualización: Explorer lee los Signals y proporciona los datos a ui-table, que muestra los registros y los estados de carga, error o ausencia de resultados.

Filtros: los cambios en los selectores de recurso y estado son gestionados por Explorer, que invoca setResource() o setStatus() en el servicio. Este actualiza los filtros y realiza una nueva consulta.

Acciones de la tabla: ui-table emite eventos mediante actionTriggered. Explorer interpreta las acciones para abrir el modal de detalle o solicitar confirmación antes de eliminar un registro.

Actualización local: al confirmar la eliminación, el servicio retira el registro del estado local mediante removeRow(). No se elimina información de la API externa.

###Diagrama de flujo

```
                  Explorer
                     |
                     v
          ResourceExplorerService
           (load / setResource /
                setStatus)
                     |
                     v
             Rick and Morty API
                     |
                     v
              Respuesta HTTP
                     |
                     v
              Signals del servicio
          (resource, status, rows,
                loading, error)
                     |
                     v
                  Explorer
                     |
             +-------+-------+
             |               |
             v               v
         ui-select        ui-table
             |               |
             v               v
       Cambios de filtro  actionTriggered
             |               |
             v               v
          Explorer         Explorer
             |               |
             v          +----+----+
          Servicio      |         |
             |          v         v
             v         Ver     Eliminar
       Nueva consulta    |         |
             |           v         v
             v         Modal   Confirmación
       Signals nuevos              |
             |                     v
             v                 removeRow()
       Interfaz actualizada      (local)
                                   |
                                   v
                            Tabla actualizada
```
###Dos detalles que debes tener presentes:

- El filtro status solamente aplica a Characters. Al cambiar de recurso, se reinicia.
- Si la API devuelve un 404 por ausencia de resultados, el servicio lo trata como estado vacío y no como un error de conexión.

## Instalación y ejecución

### Requisitos previos

| Requisito | Detalle |
|---|---|
| **Git** | Para clonar el repositorio. |
| **Node.js** | Versión 24.15.0 (utilizada durante el desarrollo y las verificaciones). |
| **npm** | Viene incluido con Node.js. |
| **Angular CLI** | Opcional: si no lo tienes instalado de forma global, usa `npx ng ...` en lugar de `ng ...`. |
| **Conexión a internet** | La demo consulta la Rick and Morty API y carga una fuente de Google Fonts. |
| **Navegador moderno** | Chrome, Edge o Firefox actualizados. |

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/gissellgelvis-maker/ui-component-library-angular.git

# Entrar al proyecto
cd ui-component-library-angular

# Instalar dependencias
npm install

# 1. Compilar la librería
ng build ui-lib

# 2. Levantar la aplicación demo
ng serve demo-app
```

Abre `http://localhost:4200`.

> **Importante:** la demo resuelve `'ui-lib'` hacia `dist/ui-lib` (ver `paths` en `tsconfig.json`), igual que lo haría con una librería publicada. Por eso hay que ejecutar `ng build ui-lib` **antes** de `ng serve demo-app`, y de nuevo cada vez que cambies código de la librería.

Si no tienes Angular CLI instalado de forma global, antepón `npx` a los comandos (`npx ng build ui-lib`).

### Desarrollo con recarga automática

Usa dos terminales:

```bash
# Terminal 1: recompila la librería al guardar
ng build ui-lib --watch --configuration development

# Terminal 2: la demo
ng serve demo-app
```

### Otros comandos

```bash
ng test ui-lib --watch=false      # pruebas de la librería
ng test demo-app --watch=false    # pruebas de la demo
ng build demo-app                 # build de producción de la demo
```

## Qué deberías ver

Para comprobar que todo quedó bien instalado, esto es lo que debe aparecer en cada paso.

### En la terminal

| Comando | Resultado esperado |
|---|---|
| `npm install` | Termina sin errores. |
| `ng build ui-lib` | `Library bundle generation complete` y `Output location: .../dist/ui-lib`. |
| `ng serve demo-app` | `Application bundle generation complete` y `Local: http://localhost:4200/`. |
| `ng test ui-lib --watch=false` | Todos los tests en verde (4 pasan al momento de escribir este documento). |
| `ng test demo-app --watch=false` | Todos los tests en verde (6 pasan al momento de escribir este documento). |

### En el navegador (`http://localhost:4200`)

Al abrir la app debe verse:

- Un fondo negro con estrellas y el título **Explorer** en verde, con brillo.
- El select **Recurso** con "Characters" seleccionado, el select **Status** en "Todos" y el botón **Limpiar filtro** apagado.
- Una tabla con **20 personajes** (el primero es Rick Sanchez), con las columnas ID, Nombre, Estado, Especie, Origen y Acciones, y los botones **Ver** y **Eliminar** en cada fila.

### Verificación paso a paso

| Acción | Resultado esperado |
|---|---|
| Cambiar **Status** a "Alive" | Se ven filas skeleton un instante y la tabla se recarga solo con personajes vivos. **Limpiar filtro** se habilita. |
| Pulsar **Limpiar filtro** | El select vuelve a "Todos" y la tabla se recarga sin filtro. |
| Cambiar **Recurso** a "Episodes" | El select de Status se reinicia, se deshabilita y muestra "No aplica". Las columnas pasan a ID, Nombre, Código y Emisión. |
| Cambiar **Recurso** a "Locations" | Las columnas pasan a ID, Nombre, Tipo y Dimensión. |
| Pulsar **Ver** en una fila | Se abre un modal con una card que muestra todos los campos del registro (con la foto, en el caso de los personajes). Se cierra con **Cerrar**, con `Escape` o haciendo clic en el fondo oscuro. |
| Pulsar **Eliminar** | Aparece un diálogo de confirmación. **Cancelar**, `Escape` o el fondo lo cierran sin cambios; **Eliminar** quita la fila de la lista. |
| Abrir las herramientas de desarrollo (F12), pestaña *Network*, elegir **Offline** y cambiar de recurso | La tabla muestra el estado de error con el mensaje "No se pudo conectar con la API. Revisa tu conexión.". Al volver a "No throttling" y cambiar de recurso, los datos regresan. |
| Eliminar todas las filas de la lista | La tabla muestra el estado vacío con un mensaje, no una tabla en blanco. |
| Reducir el ancho de la ventana (móvil) | Los selects se apilan y la tabla se desplaza horizontalmente dentro de su caja, sin desbordar la página. |

Si algo no coincide con esta tabla, revisa que ejecutaste `ng build ui-lib` antes de `ng serve demo-app`.

## API de los componentes

Todos los selectores usan el prefijo `ui-`. Se importan desde la API pública:

```ts
import { Button, Card, Select, Table } from 'ui-lib';
```

### `<ui-button>`

Botón con variantes, tamaños, apariencia y estado de carga.

| Tipo | Nombre | Tipo TS | Por defecto | Descripción |
|---|---|---|---|---|
| `input()` | `label` | `string` | `''` | Texto visible del botón. |
| `input()` | `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Estilo visual. |
| `input()` | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño. |
| `input()` | `appearance` | `'solid' \| 'outline'` | `'solid'` | Relleno sólido o solo borde. Es independiente de `variant`. |
| `input()` | `disabled` | `boolean` | `false` | Bloquea la interacción. |
| `input()` | `loading` | `boolean` | `false` | Muestra un spinner inline y bloquea el click. |
| `output()` | `clicked` | `void` | n/a | Se emite solo si el botón no está `disabled` ni `loading`. |

**Tipos exportados:** `ButtonVariant`, `ButtonSize`, `ButtonAppearance`.

```html
<ui-button label="Guardar" variant="primary" (clicked)="save()" />
<ui-button label="Ver" variant="secondary" appearance="outline" size="sm" />
<ui-button label="Eliminar" variant="danger" [loading]="isDeleting()" (clicked)="remove()" />
<ui-button label="No disponible" [disabled]="true" />
```

### `<ui-card>`

Contenedor con header (título y subtítulo) y un body que proyecta contenido arbitrario con `ng-content`.

| Tipo | Nombre | Tipo TS | Por defecto | Descripción |
|---|---|---|---|---|
| `input.required()` | `title` | `string` | n/a (obligatorio) | Título del header. |
| `input()` | `subtitle` | `string \| null` | `null` | Subtítulo opcional bajo el título. |
| `input()` | `elevation` | `'flat' \| 'raised' \| 'outlined'` | `'raised'` | Estilo visual del contenedor. |
| `output()` | `headerClicked` | `void` | n/a | Se emite al hacer clic en el header. |
| `ng-content` | n/a | n/a | n/a | Proyecta el contenido del body. |

**Tipo exportado:** `CardElevation`.

El header es un `<button>` nativo, así que funciona con teclado y lectores de pantalla. El atributo `title` del host se neutraliza para que el navegador no muestre un tooltip nativo sobre toda la card.

```html
<ui-card title="Rick Sanchez" subtitle="Alive · Human" elevation="raised" (headerClicked)="open()">
  <p>Contenido arbitrario del body.</p>
  <ui-button label="Cerrar" size="sm" (clicked)="close()" />
</ui-card>
```

### `<ui-select>`

Select con etiqueta, placeholder, estado de carga y two-way binding del valor. Usa un `<select>` nativo estilizado, por lo que funciona con teclado y en móvil.

| Tipo | Nombre | Tipo TS | Por defecto | Descripción |
|---|---|---|---|---|
| `input()` | `options` | `SelectOption[]` | `[]` | Lista de opciones `{ label, value }`. |
| `input()` | `label` | `string` | `''` | Etiqueta visible sobre el select. |
| `input()` | `placeholder` | `string` | `'Selecciona una opción'` | Texto cuando no hay selección. |
| `input()` | `loading` | `boolean` | `false` | Muestra un skeleton en lugar del select. |
| `input()` | `disabled` | `boolean` | `false` | Bloquea la interacción. |
| `model()` | `value` | `string \| null` | `null` | Valor seleccionado, con two-way binding. `null` = sin selección. |
| `output()` | `selectionChange` | `SelectOption` | n/a | Emite el objeto completo de la opción al cambiar. |

**Modelo exportado:**

```ts
interface SelectOption {
  label: string; // texto visible
  value: string; // valor que se guarda al seleccionar
}
```

```html
<!-- Two-way binding con una signal -->
<ui-select
  label="Recurso"
  placeholder="Elige un recurso"
  [options]="options"
  [(value)]="selected"
  (selectionChange)="onChange($event)"
/>

<!-- Enlace en un solo sentido (el estado vive en otro lugar, como un servicio) -->
<ui-select label="Status" [options]="statusOptions" [value]="status()" (selectionChange)="onStatus($event)" />

<ui-select label="Cargando" [options]="options" [loading]="true" />
```

### `<ui-table>`

Tabla **genérica**: no conoce el dominio de los datos. Renderiza columnas, maneja los estados de carga, error y vacío, y emite las acciones de cada fila. El componente padre decide qué significa cada acción.

| Tipo | Nombre | Tipo TS | Por defecto | Descripción |
|---|---|---|---|---|
| `input()` | `columns` | `TableColumn<T>[]` | `[]` | Definición de columnas. |
| `input()` | `rows` | `T[]` (genérico) | `[]` | Datos a renderizar. |
| `input()` | `loading` | `boolean` | `false` | Muestra filas skeleton en lugar de los datos. |
| `input()` | `emptyMessage` | `string` | `'No hay resultados para mostrar'` | Mensaje cuando `rows` está vacío. |
| `input()` | `errorMessage` | `string \| null` | `null` | Mensaje de error visible en la tabla. |
| `output()` | `actionTriggered` | `TableAction<T>` | n/a | Emite `{ action: 'view' \| 'delete', row }`. |

**Modelos exportados:**

```ts
interface TableColumn<T> {
  key: KeysOfUnion<T> & string;  // propiedad de la fila (se valida en compilación)
  header: string;                // texto del encabezado
  format?: (row: T) => string;   // formateador opcional (objetos anidados, fechas, listas)
}

type TableActionType = 'view' | 'delete';

interface TableAction<T> {
  action: TableActionType;
  row: T;
}

// Claves de todos los miembros de T cuando T es una unión de tipos
type KeysOfUnion<T> = T extends unknown ? keyof T : never;
```

**Prioridad de estados:** `loading` (skeleton) → `errorMessage` → vacío → datos. Nunca se mezclan.

```ts
// En el componente padre
protected readonly columns: TableColumn<Character>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Nombre' },
  { key: 'origin', header: 'Origen', format: (row) => row.origin.name },
];

protected onAction(event: TableAction<Character>): void {
  if (event.action === 'view') { /* abrir detalle */ }
  if (event.action === 'delete') { /* pedir confirmación */ }
}
```

```html
<ui-table
  [columns]="columns"
  [rows]="rows()"
  [loading]="loading()"
  [errorMessage]="error()"
  emptyMessage="No se encontraron personajes"
  (actionTriggered)="onAction($event)"
/>
```

## Tema y tokens de Tailwind

Los componentes de la librería **no tienen colores fijos**: usan colores semánticos (`primary`, `surface`, `line`...). La app que consume la librería define esos colores una sola vez en `tailwind.config.js`; para cambiar la paleta no hay que tocar ningún componente.

| Token | Valor (tema Rick & Morty) | Uso |
|---|---|---|
| `space` | `#000000` | Fondo de la página |
| `surface` | `#0f0f0f` | Cards, tabla, selects |
| `line` / `line-strong` | `#2a2a2a` / `#3d3d3d` | Bordes y botón secundario |
| `primary` / `primary-light` | `#51cf43` / `#7ee06f` | Verde portal: botón primario, foco, encabezados |
| `accent` / `accent-light` | `#4fa4ab` / `#9fd9de` | Teal: hover y botones outline |
| `soft` | `#c3f8a6` | Texto secundario (subtítulos) |

Además, `fontFamily.display` (título) y la animación `fade-in` (aparición suave de las filas).

```js
// tailwind.config.js (Tailwind v3)
module.exports = {
  content: ['./projects/**/*.{html,ts}'], // incluye los templates de la librería
  theme: {
    extend: {
      colors: {
        space: '#000000',
        surface: '#0f0f0f',
        line: { DEFAULT: '#2a2a2a', strong: '#3d3d3d' },
        primary: { DEFAULT: '#51cf43', light: '#7ee06f' },
        accent: { DEFAULT: '#4fa4ab', light: '#9fd9de' },
        soft: '#c3f8a6',
      },
    },
  },
};
```

> Quien use la librería debe definir estos tokens y hacer que `content` escanee los templates de `ui-lib`; de lo contrario, Tailwind no generará las clases.

Cada componente tiene estilos para los estados: default, hover, focus (anillo visible con teclado), disabled, loading y error. La animación respeta `prefers-reduced-motion` (`motion-safe`).

## Demo app: Explorer

La demo consume la Rick and Morty API e integra los cuatro componentes en un flujo cohesivo.

| Elemento | Comportamiento |
|---|---|
| `ui-select` (Recurso) | Cambia entre **Characters**, **Episodes** y **Locations**. Al cargar, Characters está preseleccionado y la tabla muestra la primera página (20 registros). |
| `ui-select` (Status) | Filtra por **Alive**, **Dead** o **Unknown**. Se reinicia al cambiar de recurso. Un botón **Limpiar filtro** vuelve a "Todos". |
| `ui-table` | Columnas distintas por recurso. Maneja loading (skeleton), vacío (mensaje ilustrado) y error (mensaje claro). |
| **Ver** | Abre un modal con `ui-card` que muestra todos los campos del registro. El contenido se proyecta con `ng-content` según el tipo de recurso. Se cierra con **Cerrar**, `Escape` o clic en el fondo. |
| **Eliminar** | Abre una confirmación. Al aceptar, quita la fila de la lista local. La tabla siempre emite `{ action: 'delete', row }`. |

### `ResourceExplorerService`

Único lugar con estado y llamadas HTTP.

| Miembro | Descripción |
|---|---|
| `resource`, `status`, `rows`, `loading`, `error` | Signals de solo lectura con el estado del flujo. |
| `statusFilterEnabled` | `computed`: `true` solo cuando el recurso activo es Characters. |
| `setResource(resource)` | Cambia el recurso, **reinicia el filtro** y recarga. |
| `setStatus(status \| null)` | Cambia el filtro y recarga. Se ignora si el recurso no lo soporta. |
| `load()` | Pide la primera página del recurso activo, con el filtro aplicado. |
| `removeRow(row)` | Quita una fila del estado local. |

## Decisiones de diseño

- **Librería agnóstica del dominio.** La tabla es genérica y recibe `format` para valores anidados. Para aceptar columnas de una unión de tipos (`Character | Episode | Location`) se usa `KeysOfUnion<T>`: con `keyof T` solo habría quedado disponible el conjunto de claves comunes. Con un tipo normal sigue siendo estricto: una clave inexistente falla al compilar.
- **Tokens semánticos en lugar de colores fijos.** La paleta se define en un solo archivo y los componentes no dependen de ella.
- **`appearance` separado de `variant`.** La prueba define `variant` como `'primary' | 'secondary' | 'danger'`; en lugar de agregar una cuarta variante, `appearance` (`solid | outline`) es un input independiente. Las acciones de la tabla usan `outline` para reducir el ruido visual, con colores de contraste alto; el botón de confirmar eliminación sigue siendo rojo sólido.
- **El filtro de status solo existe para Characters.** La API solo soporta `status` en personajes (Episodes filtra por `name` y `episode`; Locations por `name`, `type` y `dimension`). Fuera de Characters el select se deshabilita y muestra "No aplica", en lugar de enviar un parámetro que la API ignora o rechaza.
- **El filtro se reinicia en el servicio.** `setResource` limpia el status, así que el comportamiento no depende de que cada componente se acuerde de hacerlo.
- **La API responde 404 cuando no hay resultados.** El servicio lo trata como estado vacío, no como error de red. Los errores reales (sin conexión, 5xx) sí muestran el mensaje de error.
- **Cada petición cancela la anterior.** Evita que una respuesta lenta llegue tarde y pise los datos del recurso actual.
- **La tabla solo emite, el padre decide.** `actionTriggered` entrega `{ action, row }`; que "Ver" abra un modal y "Eliminar" una confirmación es decisión de la demo. Por eso cambiar la confirmación no tocó la tabla.
- **La eliminación es local.** La API es de solo lectura; la confirmación lo aclara al usuario. Al cambiar de recurso o filtro, la lista se recarga y el registro vuelve.
- **Modal reutilizable (`app-modal`).** El detalle y la confirmación comparten el mismo contenedor, que cierra con `Escape` y clic en el fondo y expone `role="dialog"` y `aria-modal`.
- **La demo lee la librería desde `dist/`.** Simula el consumo de una librería publicada, a costa de recompilar al cambiarla (ver [Instalación](#instalación-y-ejecución)).

## Pruebas

El proyecto utiliza Vitest para ejecutar las pruebas unitarias de la librería de componentes y de la aplicación demo.

Para ejecutar las pruebas, utiliza los siguientes comandos:

```bash
# Pruebas de la librería
ng test ui-lib --watch=false

# Pruebas de la aplicación demo
ng test demo-app --watch=false
```
### Resultados de la última ejecución

| Proyecto | Archivos de prueba | Pruebas aprobadas |
|---|---:|---:|
| `ui-lib` | 4 | 4 |
| `demo-app` | 5 | 6 |
| **Total** | **9** | **10** |

Las pruebas de ui-lib verifican los componentes Button, Card, Select y Table.

Las pruebas de demo-app cubren el componente principal, el explorador y los componentes relacionados con los modales y la confirmación de acciones.

Los resultados corresponden a la última ejecución realizada durante el desarrollo.

## Convenciones y flujo de trabajo

- **Ramas por funcionalidad** (`feat/`, `fix/`, `refactor/`, `test/`, `chore/`, `style/`) y un Pull Request por rama hacia `main`.
- **Conventional Commits** con commits atómicos, por ejemplo:
  - `feat: add ui-button component with variant support`
  - `feat: implement ui-table with skeleton loading state`
  - `refactor: allow union row types in ui-table column keys`
- **Tipado estricto:** `strict: true` y cero uso de `any`.
- **JSDoc** en todos los inputs, outputs y métodos públicos de los componentes de la librería.

## Limitaciones conocidas

- Solo se muestra la **primera página** de resultados (20 registros); no hay paginación.
- La eliminación no persiste: solo afecta a la lista local.
- La tipografía del título se carga desde Google Fonts, y el build de producción la descarga al compilar, así que requiere conexión a internet.
- No se usan imágenes ni logos con derechos de autor; el tema evoca la serie solo con paleta, tipografía y un fondo de estrellas hecho con CSS.


