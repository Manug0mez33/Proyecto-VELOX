**Docente:** Facundo Esteban Lemo  
**Carrera:** Desarrollo de Software  
**Espacio curricular:** Ingeniería de Software  
**Año:** 2026  
**Institución:** Tec  

# Ingeniería de Software  
## EVALUACIÓN FINAL INTEGRADORA (EFI)  

### OBJETIVO:  
Aplicar todo lo aprendido en el transcurso del año, desarrollando de esta manera un sistema completo que permita el uso de diversas herramientas que otorga el framework de Django. Especialmente, `django-rest-framework`.  

### MODALIDAD:  
La EFI será en grupos con un máximo de hasta 4 personas. Se usarán horas de clase para el desarrollo del EFI y finalmente se deberá defender oralmente, poniendo en práctica los conocimientos aprendidos respecto al funcionamiento del framework.  

Paralelamente a este proyecto de Django (de ahora en más, el "Back"), deberá desarrollarse un sistema orientado al Frontend (bajo los lineamientos estipulados en el espacio curricular de Programación III) de manera tal que finalmente, dicho proyecto haga uso de los datos expuestos por el Back, conectados a través de una API Rest.  

Ambos proyectos serán evaluados cada uno individualmente por los docentes a cargo (Lemo para el Back y Arballo para el Frontend) y la nota final de la EFI será un promedio entre las dos notas. Consecuentemente, los grupos deberán ser los mismos para ambos proyectos.  

### TEMÁTICA:  
Cada grupo podrá elegir sobre qué hacer su sistema a través de la siguiente planilla:  
*Grupos EFI 2026 Ing. de Soft. / Prog. III*  

Una vez elegida la temática, deberán inventar una "identidad". En el ejemplo de un vivero, el proyecto debe llamarse "Vivero Las Dalias" y ese debe ser el eje con el que hagan el proyecto (nombre del proyecto, objetivo en el readme, etc. etc.).  

---

### REQUISITOS:  
Si bien pueden elegir entre una variedad de temáticas, cada sistema debe estar creado desde cero e incluir los siguientes requisitos:  

#### Bases de datos:  
* Al menos 10 modelos en la base de datos.  
* Los modelos deben ser relevantes para la temática elegida.  
* Deben existir relaciones entre los modelos.  
* Planificación de las tablas y relaciones antes de desarrollar la misma, ya sea a través de un diagrama o escrito. Dicha planificación se debe adjuntar al `README.md`.  

#### API:  
* El proyecto de Django debe habilitar una API REST para comunicarse con un proyecto de frontend.  
* Al menos 8 de los 10 modelos deben habilitar un endpoint a través un `Viewset`, ya sea para habilitar un CRUD o sólo de lectura.  
* Como mínimo 2 de los `Viewsets` para CRUD deben mostrar datos anidados sólo si se consulta un `list` (`get all`), usando `NestedSerializers`.  
* Los endpoints deben estar protegidos según corresponda con autenticación de Sesión y por Tokens.  
* Deben existir por lo menos 2 funciones personalizadas en los viewset que usen el decorador `@action`.  
* Los endpoints de `get all` deben traer datos paginados.  
* Por lo menos 1 viewset debe permitir filtros y búsquedas.  
* Además, se deben servir endpoints de documentación de API (openapi, swagger y/o redoc), además de habilitar la api navegable.  

#### Vistas:  
* Debe existir una vista principal que renderice un template y que sirva de bienvenida. No es necesario que se habilite CRUD a través de formularios.  
* Se debe permitir control total con el panel de administración. Modelos relevantes deben permitir filtros, ordenamiento y búsqueda desde el panel.  

#### Otros requisitos:  
* Se debe usar `uv` como gestor de entornos virtuales.  
* Se deberá configurar CORS para permitir la conexión hacia un frontend.  
* El proyecto de Django debe estar dockerizado.  
* Se debe evidenciar un buen trabajo organizacional con Git (ramas, pull requests, commits descriptivos, etc.).  

---

### Entrega:  
* La entrega debe ser a través de un repositorio de Github (donde la última versión sea en la rama `main`/`master`).  
* El repositorio de Github debe tener un `README.md` trabajado con capturas del proyecto en funcionamiento.  
* **La fecha límite de entrega es el lunes 2 de noviembre.**  

### Defensa:  
* A partir del **martes 3 de noviembre**, comenzarán las defensas donde todo el grupo debe presentar y explicar los componentes del back, además de relatar cómo fue el proceso que llevaron a cabo desde que arrancaron el proyecto hasta que lo terminaron. Tomaré relevancia únicamente del proyecto de Django, no del frontend. Las defensas pueden ser virtuales o presenciales.