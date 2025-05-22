# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.0.1](https://github.com/LuisSubiabre/app-react-shadc/compare/v3.0.0...v3.0.1) (2025-05-22)

## [3.0.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.9.2...v3.0.0) (2025-05-22)


### Features

* agregar funcionalidad para gestionar informes de personalidad, incluyendo carga, edición y guardado de datos, así como la visualización de información relevante en un modal. ([14250e1](https://github.com/LuisSubiabre/app-react-shadc/commit/14250e194f39257bad777ff5cf14239a7a363021))
* agregar funcionalidades de exportación a Excel y PDF para los promedios de asignaturas, mejorando la visualización y accesibilidad de los datos. ([79a9507](https://github.com/LuisSubiabre/app-react-shadc/commit/79a9507f6ee9636f7c52cfa225bf9e79bc49f6b7))

### [2.9.2](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.9.1...v2.9.2) (2025-05-07)

### [2.9.1](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.9.0...v2.9.1) (2025-05-07)


### Features

* agregar archivo PDF de Declaración Individual de Accidente y mejorar la carga del mismo con manejo de errores en la página de accidente escolar ([525f5f2](https://github.com/LuisSubiabre/app-react-shadc/commit/525f5f29144252c85068aa6e477593b59899672f))
* agregar configuración de Vercel para el manejo de archivos PDF y redirección a la página de accidente escolar desde la ruta del PDF ([ccc514e](https://github.com/LuisSubiabre/app-react-shadc/commit/ccc514e252dc4e94574e2ff5b56ae3d21353e1e1))
* mejorar la navegación en la tabla de calificaciones al manejar correctamente el enfoque de los inputs en las filas y columnas ([bfb219f](https://github.com/LuisSubiabre/app-react-shadc/commit/bfb219f538da09993cb0fb1f5e5a5560feb9eda3))


### Bug Fixes

* corregir el cálculo de promedios en la impresión de la libreta utilizando Math.floor en lugar de Math.round ([5a1e945](https://github.com/LuisSubiabre/app-react-shadc/commit/5a1e9450ce3539ce7b75392b322fb297cb03efac))

## [2.9.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.8.1...v2.9.0) (2025-05-05)


### Features

* actualizar la lógica de filtrado y búsqueda de estudiantes en la página de accidente escolar, además de mejorar la gestión de testigos y la generación de PDF con datos del accidente ([9b7d4ee](https://github.com/LuisSubiabre/app-react-shadc/commit/9b7d4ee0fe7aa7f15ad02b4f5f4609b62c564e63))
* agregar campos para horario y testigos en el formulario de registro de accidente escolar, además de ajustar la visualización de fechas en el PDF ([3c2488f](https://github.com/LuisSubiabre/app-react-shadc/commit/3c2488ffe3e13be53b5f88833998053741e18a41))
* agregar dependencia pdf-lib y sus módulos relacionados en package.json y package-lock.json ([272eaea](https://github.com/LuisSubiabre/app-react-shadc/commit/272eaeaeca37a62c6443d621b1edb5c193dfd87f))
* agregar firma del director en el PDF de la libreta de notas, incluyendo la imagen de la firma en la posición adecuada ([ad93fd9](https://github.com/LuisSubiabre/app-react-shadc/commit/ad93fd9dc627f0aa1edd69d676ec73d6f3934215))
* agregar formulario de registro de accidente escolar con nuevos estados y campos para la información del accidente ([7d8a8ce](https://github.com/LuisSubiabre/app-react-shadc/commit/7d8a8cedc1c17ec6de4940f47b4182cca6cab908))
* agregar función para formatear fechas en el informe de asistencia y mejorar la generación de tablas agrupadas por fecha y sesión en el PDF ([564c4f2](https://github.com/LuisSubiabre/app-react-shadc/commit/564c4f2dbd7d7a1b30f10fc48c1e9973733e1219))
* agregar lógica para calcular y mostrar promedios finales de asignaturas en la libreta de notas, incluyendo ajustes en la estructura de datos y mejoras en la presentación del PDF ([8bd3a1f](https://github.com/LuisSubiabre/app-react-shadc/commit/8bd3a1fcc70d02465721b477ec06e9ad7cee7338))
* agregar lógica para obtener y mostrar el día de la semana y el tipo de accidente en el PDF, además de limitar la descripción del accidente a 250 caracteres ([02476a9](https://github.com/LuisSubiabre/app-react-shadc/commit/02476a9fa5d9f8f364170995b3fd4b1587ee6b94))
* agregar manejo de errores en la obtención de datos del estudiante y mejorar la presentación de la información en el modal de registro de accidente escolar ([719036a](https://github.com/LuisSubiabre/app-react-shadc/commit/719036a9f79af9da0909ab0286e62b6fa753a9f0))
* agregar mensaje de advertencia en el modal de registro de accidente escolar, informando que la información no se almacena y solo se genera un archivo PDF ([7137caf](https://github.com/LuisSubiabre/app-react-shadc/commit/7137cafe5ce827f8456531f14d258c7264de6f66))
* agregar modal de asistencia en la página de talleres, incluyendo lógica para abrir y cerrar el modal desde la tabla de talleres ([9c8b867](https://github.com/LuisSubiabre/app-react-shadc/commit/9c8b8670ec205fc494a3a07066317602b515acec))
* agregar página de Accidente Escolar y ruta correspondiente en el sidebar ([5dbe633](https://github.com/LuisSubiabre/app-react-shadc/commit/5dbe63397093a31ef08476b1be6035094ab45582))
* datos pdf ([fe7aa94](https://github.com/LuisSubiabre/app-react-shadc/commit/fe7aa947bd29fcc4eddc2dae137d5d749838c93e))
* implementar generación de PDF consolidado para estudiantes, incluyendo mejoras en la lógica de descarga y visualización de estado de carga ([b419051](https://github.com/LuisSubiabre/app-react-shadc/commit/b4190511fbe2e757093c5d6827d33933793e0168))
* mejorar visualización del nombre completo y del curso en la página de accidente escolar ([9f91156](https://github.com/LuisSubiabre/app-react-shadc/commit/9f91156e5a7efa49f9fceed62971d39035b350d4))


### Bug Fixes

* actualizar la URL de la imagen de la firma en el PDF de la libreta de notas para asegurar su correcta visualización ([195b9f0](https://github.com/LuisSubiabre/app-react-shadc/commit/195b9f0a209df67c22e7887789ead3863b217f66))
* cambiar tipos de datos de telpar y celular a string | number y agregar consola para depuración en pageAccidente.tsx ([85eb266](https://github.com/LuisSubiabre/app-react-shadc/commit/85eb266f89a34b8c6bf49ed634365a49fc3a9721))
* restablecer el estado inicial de la circunstancia del accidente en la página de accidente escolar ([a2f2bd8](https://github.com/LuisSubiabre/app-react-shadc/commit/a2f2bd89edf34ce34038ddcf368aff9db16d9dbe))

### [2.8.1](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.8.0...v2.8.1) (2025-04-25)


### Bug Fixes

* input numerico inicio y final cambia valores con flechas del teclado ([9301d4c](https://github.com/LuisSubiabre/app-react-shadc/commit/9301d4c10c580086440ab4917d2b58c5224a54c9))

## [2.8.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.7.2...v2.8.0) (2025-04-24)


### Features

* calendarios ([14113c9](https://github.com/LuisSubiabre/app-react-shadc/commit/14113c99db7e8031e01b649e9c0edc2ccb624e29))

### [2.7.2](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.7.1...v2.7.2) (2025-04-21)


### Features

* libreta pdf ([a0e331f](https://github.com/LuisSubiabre/app-react-shadc/commit/a0e331ffd4cc5f6d8ea540354694aa3a652b622c))

### [2.7.1](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.7.0...v2.7.1) (2025-04-17)


### Features

* saltar casilleron de calificaciones con enter ([3162110](https://github.com/LuisSubiabre/app-react-shadc/commit/31621101edf17c5868925c4856211144a3129fae))

## [2.7.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.6.1...v2.7.0) (2025-04-17)


### Features

* agregar gráfico de promedios finales en PDF de libreta ([a909000](https://github.com/LuisSubiabre/app-react-shadc/commit/a9090009f11e573f680c6ccccaca89fff6e785e6))
* boton inscripcion ([7995804](https://github.com/LuisSubiabre/app-react-shadc/commit/7995804fe8abccd582f0edfb6d578aebd2349506))
* componente imprimir libreta ([fdeb3bd](https://github.com/LuisSubiabre/app-react-shadc/commit/fdeb3bd00e832cc7b01b46473f4942a9985ac6a3))
* endpoint libreta ([36fe01a](https://github.com/LuisSubiabre/app-react-shadc/commit/36fe01a37a013c42f2ad68156866824191c10e91))
* gestion inscripciones asignatura en componente de ingreso de calificaciones ([f7c57d4](https://github.com/LuisSubiabre/app-react-shadc/commit/f7c57d4ce65333524818cd3160177b5de880b0fa))
* iconoos para asignaturas comunes y conceptuales ([dc2d0d4](https://github.com/LuisSubiabre/app-react-shadc/commit/dc2d0d4ab927e1d6db53c961cea8918c007b7f1b))
* info inscritos y no inscritos ([08350ae](https://github.com/LuisSubiabre/app-react-shadc/commit/08350aee41f8d0ee9fbaf8072fc70dfb91214dc8))
* libreta PDF ([7b25976](https://github.com/LuisSubiabre/app-react-shadc/commit/7b25976b974e3fc18757d7dc348644e6c00b45c3))
* nota concepto ([46e932b](https://github.com/LuisSubiabre/app-react-shadc/commit/46e932bf7f2c03a7e26e49d0765d350dd6ba405b))
* pdf libreta ([ddedff6](https://github.com/LuisSubiabre/app-react-shadc/commit/ddedff682277384873b280c96da40d8a734a1cc4))
* pdf libreta ([e62cbf0](https://github.com/LuisSubiabre/app-react-shadc/commit/e62cbf01db83bd5045fed1b25df439955a40b18d))
* promedio 1s en pf cuando no existe promedio 2s ([09cea50](https://github.com/LuisSubiabre/app-react-shadc/commit/09cea5068a8caddd2c5aa91769c917da3b14a3dd))

### [2.6.1](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.6.0...v2.6.1) (2025-04-11)


### Features

* dialogo ontop, solo se cierra con boton ([b075a0b](https://github.com/LuisSubiabre/app-react-shadc/commit/b075a0bb296fe5604d8bea4ef838df85f101fe11))
* inscritos en taller + copia de correos ([ce2452a](https://github.com/LuisSubiabre/app-react-shadc/commit/ce2452a805b52465e31b1760acb5985b1c913b5c))
* toast copia de correos ([e6b2e54](https://github.com/LuisSubiabre/app-react-shadc/commit/e6b2e54d3cf8c20cdca698e81efac37ef3c2c99b))


### Bug Fixes

* correccion nùmero de inscritos ([b5cf691](https://github.com/LuisSubiabre/app-react-shadc/commit/b5cf691bfdab2b1e46bc441c6c7eec8502549627))

## [2.6.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.5.0...v2.6.0) (2025-04-11)


### Features

* iconos ([c20dc4e](https://github.com/LuisSubiabre/app-react-shadc/commit/c20dc4e8c043cf5e8ef7ca27f9c0b7c0b815ccd1))
* profesor jefe asistencia ([0933bcd](https://github.com/LuisSubiabre/app-react-shadc/commit/0933bcd898f3e78fd0d080a64dbb1d94e1c6ca8a))
* profesor jefe modal atrasos ([b87d9cb](https://github.com/LuisSubiabre/app-react-shadc/commit/b87d9cb659737dfa2ed3270cc5ca8462ed9dedcd))

## [2.5.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.4.1...v2.5.0) (2025-04-09)


### Features

* reporte de atrasos ([b9debd4](https://github.com/LuisSubiabre/app-react-shadc/commit/b9debd4ad7e989ac9e99f6298478a27415b82738))

### [2.4.1](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.4.0...v2.4.1) (2025-04-08)


### Bug Fixes

* obtenerTalleresPorEstudiante ([d1568a5](https://github.com/LuisSubiabre/app-react-shadc/commit/d1568a57e7497ac50c19e499dda852ce6e7f8560))

## [2.4.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.3.0...v2.4.0) (2025-04-08)


### Features

* boton talleres ([c779bbc](https://github.com/LuisSubiabre/app-react-shadc/commit/c779bbc3800854252e66404b3651ca757737e9c8))

## [2.3.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.2.0...v2.3.0) (2025-04-08)


### Features

* boton pdf inscritos ([b1108d5](https://github.com/LuisSubiabre/app-react-shadc/commit/b1108d5faae8c0f2d92f6eee416ccbb98390e314))
* copy emails ([5d9fa98](https://github.com/LuisSubiabre/app-react-shadc/commit/5d9fa98118a3f62b989bcf9e615efeb16052e14e))
* tabla talleres ([215c506](https://github.com/LuisSubiabre/app-react-shadc/commit/215c5067d451c8642e8bd720c5b870bcaf2ebde5))
* tabla talleres ([f170e2a](https://github.com/LuisSubiabre/app-react-shadc/commit/f170e2afcd6a2cc836b796f3a6789d50f983f730))

## [2.2.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.1.1...v2.2.0) (2025-04-07)


### Features

* pdf talleres acle jefatura ([fdf68ea](https://github.com/LuisSubiabre/app-react-shadc/commit/fdf68ea791a51546478c2cbb7da1f85e35fbdca1))

### [2.1.1](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.1.0...v2.1.1) (2025-04-07)


### Features

* ubicacion pdf ([c468d91](https://github.com/LuisSubiabre/app-react-shadc/commit/c468d916151ac34e40bf0544f7ec4ca5798f1860))


### Bug Fixes

* curso_id jefatura ([edac947](https://github.com/LuisSubiabre/app-react-shadc/commit/edac9477004c171cacf78d0ceadf7b9c89ebd02d))

## [2.1.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v2.0.0...v2.1.0) (2025-04-07)


### Bug Fixes

* profesor jefe ([3b74e6d](https://github.com/LuisSubiabre/app-react-shadc/commit/3b74e6d8dca2b3d92ea2e628cecef7dc2374f71d))

## [2.0.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v1.2.6...v2.0.0) (2025-04-04)


### Features

* asistencia a talleres ([d70d4a7](https://github.com/LuisSubiabre/app-react-shadc/commit/d70d4a780356842e5e3cff2deaeaa9ef3b43fdf3))
* asistencia sesiones acles ([f99619e](https://github.com/LuisSubiabre/app-react-shadc/commit/f99619e1c948833d7caf9529ccb89e13bdf6a928))
* link monitor acle ([c849dfa](https://github.com/LuisSubiabre/app-react-shadc/commit/c849dfa0dd11bad8df5f1c80650fd91c54d617ac))
* mostrar y eliminar sesiones de talleres ([17334a2](https://github.com/LuisSubiabre/app-react-shadc/commit/17334a2315a59813a3b5747b13c48fe3ebe9f064))
* sesiones token ([3493003](https://github.com/LuisSubiabre/app-react-shadc/commit/3493003311a6037c5153cbfa70c2443187b34fad))
* talleres monitores + login token expirado ([ac45022](https://github.com/LuisSubiabre/app-react-shadc/commit/ac45022c9b3ca6ee3d768a7d4acfbc4df57c743d))
* ubicacion talleres ([e48c4e8](https://github.com/LuisSubiabre/app-react-shadc/commit/e48c4e8d8c6c219419874c9e7f86d24bdc12ba72))


### Bug Fixes

* arreglo DB estado ([a015aa5](https://github.com/LuisSubiabre/app-react-shadc/commit/a015aa574c5360a7414772df302e6e8da41dd1b8))
* fecha ([9342107](https://github.com/LuisSubiabre/app-react-shadc/commit/9342107a0491c9f7ebd31ffb2a3afc0585665594))
* restore code ([b44ca8d](https://github.com/LuisSubiabre/app-react-shadc/commit/b44ca8dcc1148426d35aca33b2015fed01d416eb))

### [1.2.6](https://github.com/LuisSubiabre/app-react-shadc/compare/v1.2.5...v1.2.6) (2025-03-25)


### Features

* orden talleres acles y colores ([5517c1d](https://github.com/LuisSubiabre/app-react-shadc/commit/5517c1dc17001732cf31a1db0fce55c00a3957f1))
* **usuarios:** mejora la interfaz del modal de asignación de cursos ([e8c7294](https://github.com/LuisSubiabre/app-react-shadc/commit/e8c729467fd3369979df9fe2b73d2fbb1a24bf03))

### [1.2.5](https://github.com/LuisSubiabre/app-react-shadc/compare/v1.2.4...v1.2.5) (2025-03-24)


### Features

* cursos asignados ([521102a](https://github.com/LuisSubiabre/app-react-shadc/commit/521102a466b77a1c9a332b3e65d62b8594209c5d))
* mejora carga de estudiantes inscritos ([cc3be20](https://github.com/LuisSubiabre/app-react-shadc/commit/cc3be200b25497b3482d1354a8afa1e18dc2dc0b))

### [1.2.4](https://github.com/LuisSubiabre/app-react-shadc/compare/v1.2.3...v1.2.4) (2025-03-24)


### Bug Fixes

* codigo no utilizado ([c33ca6f](https://github.com/LuisSubiabre/app-react-shadc/commit/c33ca6fc0b0703e69c472472d507af7891c117e0))

### [1.2.3](https://github.com/LuisSubiabre/app-react-shadc/compare/v1.2.2...v1.2.3) (2025-03-24)

### [1.2.2](https://github.com/LuisSubiabre/app-react-shadc/compare/v1.2.1...v1.2.2) (2025-03-20)


### Features

* calendario ([021a703](https://github.com/LuisSubiabre/app-react-shadc/commit/021a703c584778fc9ddd82227c7ac1441c7a4490))
* **dashboard:** ocultar botones de atraso en TablaEstudiantes ([df2141f](https://github.com/LuisSubiabre/app-react-shadc/commit/df2141ff50273f08de0462638e2a0c1019d803b7))
* **login:** mensaje usuario inactivo ([2ebba53](https://github.com/LuisSubiabre/app-react-shadc/commit/2ebba531e62d1457b0a18c57ce9a310e4d5134c4))


### Bug Fixes

* a to Link ([437f336](https://github.com/LuisSubiabre/app-react-shadc/commit/437f33617a04e9546f7e10527aaa6c35b5e69154))

### [1.2.1](https://github.com/LuisSubiabre/app-react-shadc/compare/v1.2.0...v1.2.1) (2025-03-18)


### Features

* **pageCursos:** pdf con clave correo ([77b21e0](https://github.com/LuisSubiabre/app-react-shadc/commit/77b21e01329dad4fc2320e1e7db852455c86a620))

## [1.2.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v1.1.1...v1.2.0) (2025-03-18)


### Features

* se añade tipo de atraso jornada o llegada ([e93bfc5](https://github.com/LuisSubiabre/app-react-shadc/commit/e93bfc568025acdab3c61daaae290f3066b97bc0))


### Bug Fixes

* busqueda por apellido paterno ([7d77d07](https://github.com/LuisSubiabre/app-react-shadc/commit/7d77d07ab94fbc95ea14b76dbd150147b5fac54d))
* orden y busqueda de estudiantes por apellido paterno ([a7d1cd7](https://github.com/LuisSubiabre/app-react-shadc/commit/a7d1cd7d1c8ec69b3da978df46e28d2159085d29))
* rol talleres acle ([bc4ad0d](https://github.com/LuisSubiabre/app-react-shadc/commit/bc4ad0d4ed4c079eb4a03daddd7805fe196f44f2))

### [1.1.1](https://github.com/LuisSubiabre/app-react-shadc/compare/v1.1.0...v1.1.1) (2025-03-16)


### Bug Fixes

* icon Info delete ([9b64b4f](https://github.com/LuisSubiabre/app-react-shadc/commit/9b64b4f08291bad701c78eedb7ec7d459fa88a7c))

## [1.1.0](https://github.com/LuisSubiabre/app-react-shadc/compare/v1.0.1...v1.1.0) (2025-03-16)


### Features

* mejora diseño de modulo talleres ([07deee0](https://github.com/LuisSubiabre/app-react-shadc/commit/07deee0b155b4a0492a07d5cbb7fe543314dba47))
* radio por botones para notas conceptuales ([9d1b091](https://github.com/LuisSubiabre/app-react-shadc/commit/9d1b091a23743792710b83d966a02108883e682a))
* spinner de carga al abrir modal ([5d0b558](https://github.com/LuisSubiabre/app-react-shadc/commit/5d0b558abb1b1f7db67cb93530830ab24424acdb))

### [1.0.1](https://github.com/LuisSubiabre/app-react-shadc/compare/v1.0.0...v1.0.1) (2025-03-16)

## 1.0.0 (2025-03-16)


### Features

*  eliminar concepto ([abde6a4](https://github.com/LuisSubiabre/app-react-shadc/commit/abde6a470223a6e9306e69eeb39cfff4bd8be232))
* atrasos ([cc1b706](https://github.com/LuisSubiabre/app-react-shadc/commit/cc1b706d9fd30de1528f83479fcf3ee3b423f56c))
* atrasos reloj ([ec188ca](https://github.com/LuisSubiabre/app-react-shadc/commit/ec188caa79e806577195875a8fbc99044c1a6981))
* atrasos visual ([e706e1e](https://github.com/LuisSubiabre/app-react-shadc/commit/e706e1e431520d68c2fa2cff33bdd79ddf051023))
* buscador estudiantes ([e100fe5](https://github.com/LuisSubiabre/app-react-shadc/commit/e100fe54b28624fa341142e46563b29cc7f059b0))
* calendario ([1b5f2d2](https://github.com/LuisSubiabre/app-react-shadc/commit/1b5f2d2acac3c0616859407edc3ad8f2844f23bc))
* carga estudiantes en asignatura curso ([60fc89b](https://github.com/LuisSubiabre/app-react-shadc/commit/60fc89b3acb32e7d4e18f6f147ad35508be3c341))
* carga spinner ([0c18bd5](https://github.com/LuisSubiabre/app-react-shadc/commit/0c18bd5e7afadb68687470e477cd5f8b9a755b8f))
* color input ([85f6e4b](https://github.com/LuisSubiabre/app-react-shadc/commit/85f6e4bf97cfcc7ecc9c505f9f0e4047db811579))
* color theme vscode ([356b463](https://github.com/LuisSubiabre/app-react-shadc/commit/356b463859316fc2f7cfdbc5bde608eb8a7db7cf))
* copiar al portapapeles datos de correo y clave del estudiante ([be72e86](https://github.com/LuisSubiabre/app-react-shadc/commit/be72e86a399c45f02cccc36ed6e3f6317abd690c))
* curso ([b4a3d46](https://github.com/LuisSubiabre/app-react-shadc/commit/b4a3d46d0a03400d1fce8347f4a2658a747b307a))
* dashboard ([adaee34](https://github.com/LuisSubiabre/app-react-shadc/commit/adaee34fa7e4eb25995182d6baddf651eb5a139f))
* dev container ([3b787ac](https://github.com/LuisSubiabre/app-react-shadc/commit/3b787ac2e0191deb8de865c607848aad85e67bef))
* Error Boundary para capturar errores ([a0369ea](https://github.com/LuisSubiabre/app-react-shadc/commit/a0369ea138a885c143cf3952587eb8a2bde627ec))
* estudiantes filtro ([d7c9305](https://github.com/LuisSubiabre/app-react-shadc/commit/d7c9305293c61946e20bf0786ad5260b80cf5db4))
* first commit devcontainer ([d28c595](https://github.com/LuisSubiabre/app-react-shadc/commit/d28c595c68f65b7da6582346e341ece9a9fd8f3d))
* gestion de atrasos ([727b7f1](https://github.com/LuisSubiabre/app-react-shadc/commit/727b7f15017951492cfff1f15cec4f056be5cb36))
* info retirados y activos ([ad05362](https://github.com/LuisSubiabre/app-react-shadc/commit/ad05362f3e1285c8d6e08ec30e0c8f0221ab5df4))
* jefaturas ([764f786](https://github.com/LuisSubiabre/app-react-shadc/commit/764f786af22b0c17925dde24e5b936b0b2b11ff1))
* jefaturas ([c9c22d6](https://github.com/LuisSubiabre/app-react-shadc/commit/c9c22d61182b63d7d4ab76306232737b845e6e0b))
* lazy loading and suspense ([91eb7ed](https://github.com/LuisSubiabre/app-react-shadc/commit/91eb7ed33c6cd2e92d8d4f3c602c138e5ed9ea3e))
* listado de curso en jefatura ([25a28ac](https://github.com/LuisSubiabre/app-react-shadc/commit/25a28ac590cbf25bcbc8da65e3b179d1ae8db3fc))
* login ([15e3888](https://github.com/LuisSubiabre/app-react-shadc/commit/15e38882594d6593f6c3004bba5247513db4f9e9))
* login ([2cba6c8](https://github.com/LuisSubiabre/app-react-shadc/commit/2cba6c867c4aa82e70925360bb41c199b3a1186a))
* mejora ux ([b021a61](https://github.com/LuisSubiabre/app-react-shadc/commit/b021a61c7882faae685850f8e52dc90ba473a59d))
* mensaje de error login ([c3aaa9a](https://github.com/LuisSubiabre/app-react-shadc/commit/c3aaa9abf5c2c169b270af783c2d6f99752602e9))
* modal estudiante curso ([8058ad5](https://github.com/LuisSubiabre/app-react-shadc/commit/8058ad51387321ac911d57136e9a7c95d45821b9))
* modificacion visual tabla ([6b5e3e4](https://github.com/LuisSubiabre/app-react-shadc/commit/6b5e3e4d1bad869c450cb52a21013d7f1eefafc4))
* modo oscuro/claro ([1001526](https://github.com/LuisSubiabre/app-react-shadc/commit/1001526fa2f0c0278f05d6f40b7f22d360078958))
* recuperacion clave ([dc888be](https://github.com/LuisSubiabre/app-react-shadc/commit/dc888be8a9be2750facd34740900fe06b43b1523))
* reordenar estudiantes ([40afc51](https://github.com/LuisSubiabre/app-react-shadc/commit/40afc518bc2b839387fbc155d4a1664d1e47d6c9))
* Retirados e Inscritos ([4d9c566](https://github.com/LuisSubiabre/app-react-shadc/commit/4d9c5666fcb0581431eb06306f4b930b2b16c316))
* standard version ([9622aa9](https://github.com/LuisSubiabre/app-react-shadc/commit/9622aa9b052cc38395f5f058491fcc358cd88dd7))
* standard version ([e545738](https://github.com/LuisSubiabre/app-react-shadc/commit/e5457382a2d846e3b601edcb5207598db8d09948))
* visual activos y retirados ([ad41bed](https://github.com/LuisSubiabre/app-react-shadc/commit/ad41bed4c37a7ac54adc29046b2ddf872eee50b1))
* vs color theme ([36daf75](https://github.com/LuisSubiabre/app-react-shadc/commit/36daf75fb2daa5e9475c0133abcf5d4cb36a8e4a))


### Bug Fixes

* 2 impresiones ([ff4173e](https://github.com/LuisSubiabre/app-react-shadc/commit/ff4173e79484c2d5ee12ba6a5b14afb29c04c76f))
* calendar ([b1f1f07](https://github.com/LuisSubiabre/app-react-shadc/commit/b1f1f0753935ba75189506e2fa457722beef6acf))
* calendar ([208cae7](https://github.com/LuisSubiabre/app-react-shadc/commit/208cae7e68a73fa976de7929ef811feb9b00f23b))
* calendario ([f1b2e17](https://github.com/LuisSubiabre/app-react-shadc/commit/f1b2e179249d34d9cbf5afee6dfb37aa4b7397d2))
* caret ([6ec57bd](https://github.com/LuisSubiabre/app-react-shadc/commit/6ec57bdcbad3e7e101ba393090648304e523648d))
* data ([eea38ca](https://github.com/LuisSubiabre/app-react-shadc/commit/eea38ca2226f786a214b83149f55a970066cba3f))
* doble impresion ([8584e53](https://github.com/LuisSubiabre/app-react-shadc/commit/8584e5331dcfea27f31c27a57874f7f23669988a))
* error install ([b2ff491](https://github.com/LuisSubiabre/app-react-shadc/commit/b2ff491f1b2fc0e38da91036cc4943f255bb1610))
* impresion+logo ([82e542f](https://github.com/LuisSubiabre/app-react-shadc/commit/82e542ffdcbe3d94a69b88051b8fa3438ab40252))
* logo ([cc69c98](https://github.com/LuisSubiabre/app-react-shadc/commit/cc69c98991e07e5e5de74a864de32f0d44f398a9))
* logo cloudinary ([0a5c7b9](https://github.com/LuisSubiabre/app-react-shadc/commit/0a5c7b9eec6fe7b0d6acf1153a6df0eb5c7c08c9))
* rutas ([82c7b2c](https://github.com/LuisSubiabre/app-react-shadc/commit/82c7b2c1c399c3426281c77bd7294029792db76f))
* rutas ([3dcbf66](https://github.com/LuisSubiabre/app-react-shadc/commit/3dcbf6603673ac388f74519a85fdfd81e342be69))
* schema validation ([1fdee95](https://github.com/LuisSubiabre/app-react-shadc/commit/1fdee959f4a668ad8ba08f7bc5f7a0d6c4df3d63))
* tipados ([51a5180](https://github.com/LuisSubiabre/app-react-shadc/commit/51a518099cee6a9f03c8ce0eca4f59d448c9d568))
* url ([4b0d0a2](https://github.com/LuisSubiabre/app-react-shadc/commit/4b0d0a2ab84c5b73218d78ceb6f592753f65e95b))
