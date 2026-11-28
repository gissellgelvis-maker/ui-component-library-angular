# UI Library (`ui-lib`)

Librería reutilizable de componentes desarrollada con Angular y TypeScript como parte de una prueba técnica para el cargo de Aprendiz / Practicante de Desarrollo Frontend.

Incluye cuatro componentes independientes y reutilizables, construidos con **Tailwind CSS** y una arquitectura `standalone` con `ChangeDetectionStrategy.OnPush` y Signals de Angular:

- **Button (`<ui-button>`)**: botón con variantes, tamaños y estados.
- **Card (`<ui-card>`)**: contenedor con encabezado y contenido proyectado.
- **Select (`<ui-select>`)**: selector de opciones con etiqueta, enlace bidireccional y estado de carga.
- **Table (`<ui-table>`)**: tabla genérica con columnas configurables y estados de carga, error y vacío.

## Requisitos previos

- **Node.js** compatible con Angular 22 (revisa la versión usada en el `README.md` principal).
- **npm** (`11.12.1` en el workspace).
- **Angular CLI**, disponible mediante `npx ng`.

## Compilación

Desde la raíz del workspace, ejecuta:

```bash
npm install
npx ng build ui-lib
```

La compilación genera los artefactos de la librería en `dist/ui-lib/`.

## Importación de componentes

Los componentes se exportan desde la API pública de la librería (`public-api.ts`), por lo que se importan desde `'ui-lib'`:

```ts
import { Button, Card, Select, Table } from 'ui-lib';
```

Al ser componentes standalone, se añaden directamente al arreglo `imports` del componente que los consume:

```ts
import { Component } from '@angular/core';
import { Button, Card, Select, Table } from 'ui-lib';

@Component({
  standalone: true,
  imports: [Button, Card, Select, Table],
  templateUrl: './example.component.html',
})
export class ExampleComponent {}
```

## Componentes disponibles

La tabla completa de API (tipos, valores por defecto y más ejemplos) está en la sección [API de los componentes](../../README.md#api-de-los-componentes) del README principal. Aquí va un resumen.

### `<ui-button>`

Botón reutilizable con variantes visuales, tamaños y estados de interacción.

**Propiedades:**

- `label`: texto del botón.
- `variant`: `primary`, `secondary` o `danger`.
- `size`: `sm`, `md` o `lg`.
- `appearance`: `solid` u `outline`.
- `disabled`: deshabilita la interacción.
- `loading`: muestra un indicador de carga y bloquea el click.

**Evento:**

- `clicked`: se emite al hacer click, solo si el botón no está `disabled` ni `loading`.

```html
<ui-button label="Guardar" variant="primary" (clicked)="save()" />
```

### `<ui-card>`

Contenedor con encabezado (título y subtítulo) y un cuerpo que proyecta contenido arbitrario con `ng-content`.

**Propiedades:**

- `title`: título del encabezado (obligatorio).
- `subtitle`: subtítulo opcional (`string | null`).
- `elevation`: `flat`, `raised` u `outlined`.

**Evento:**

- `headerClicked`: se emite al hacer clic en el encabezado.

```html
<ui-card title="Rick Sanchez" subtitle="Alive · Human" (headerClicked)="open()">
  <p>Contenido del cuerpo.</p>
</ui-card>
```

### `<ui-select>`

Selector de opciones con etiqueta, placeholder y estado de carga.

**Propiedades:**

- `options`: lista de opciones `{ label, value }`.
- `label`: etiqueta visible sobre el select.
- `placeholder`: texto cuando no hay selección.
- `loading`: muestra un skeleton en lugar del select.
- `disabled`: deshabilita la interacción.
- `value`: valor seleccionado, con enlace bidireccional (`[(value)]`).

**Evento:**

- `selectionChange`: emite el objeto completo de la opción seleccionada.

```html
<ui-select label="Recurso" [options]="options" [(value)]="selected" (selectionChange)="onChange($event)" />
```

### `<ui-table>`

Tabla genérica que permite mostrar distintos modelos de datos sin depender de una estructura específica.

**Propiedades:**

- `columns`: configuración de las columnas (`{ key, header, format? }`).
- `rows`: registros que se mostrarán.
- `loading`: muestra filas skeleton.
- `emptyMessage`: mensaje cuando no hay registros.
- `errorMessage`: mensaje de error de red.

**Evento:**

- `actionTriggered`: emite `{ action: 'view' | 'delete', row }`. El componente padre decide qué hacer con cada acción.

```html
<ui-table [columns]="columns" [rows]="rows()" [loading]="loading()" (actionTriggered)="onAction($event)" />
```

## Estilos y configuración de Tailwind CSS

La librería utiliza tokens semánticos de Tailwind CSS para definir los colores de sus componentes.

El proyecto que consume la librería debe configurar los tokens utilizados y asegurarse de que Tailwind escanee los templates de `ui-lib`.

Consulta la sección [Tema y tokens de Tailwind](../../README.md#tema-y-tokens-de-tailwind) del README principal para ver la configuración de la paleta y el ejemplo de `tailwind.config.js`.

## Pruebas

Para ejecutar las pruebas unitarias de la librería desde la raíz del workspace:

```bash
ng test ui-lib --watch=false
```

Las pruebas verifican que los cuatro componentes (Button, Card, Select y Table) se crean correctamente.

## Proyecto de demostración

El workspace incluye `demo-app`, una aplicación que consume `ui-lib` y demuestra el uso de sus componentes mediante un explorador de personajes, episodios y ubicaciones de Rick and Morty.

Para conocer la instalación completa, los ejemplos de uso y la arquitectura del proyecto, consulta el [README principal](../../README.md).
