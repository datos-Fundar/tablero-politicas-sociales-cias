/* =============================================================================
   Datos del tablero "Mapa de las políticas sociales" (CIAS - Fundar)

   ARCHIVO GENERADO por scripts/preparar_datos.py a partir de las bases Excel.
   Para actualizar: correr el script (no editar las series a mano).
   Los textos (meta, nombres, descripciones) se editan en scripts/plantilla_datos.js.

   - "anios" define el eje temporal; todas las series tienen el mismo largo.
   - El último año de "anios" es el que usan los indicadores principales.
   - "anio_base" es el año contra el que se calcula la variación central (último año del gobierno anterior).
   - Montos: billones de pesos constantes (ver meta.unidad). null = sin dato o el programa no existía.
   - Cobertura: beneficiarios / población de referencia del programa (poblacion_ref), en %.
   - Beneficiarios: promedio anual. Beneficio: monto mensual promedio del año, en pesos de diciembre de 2025.
============================================================================= */
window.DATOS_CIAS = {
  meta: {
    titulo: 'Mapa de las políticas sociales en la Argentina',
    actualizado: '2026-11-24',
    unidad: 'billones de pesos constantes de diciembre de 2025',
    unidad_corta: 'billones de pesos de dic-2025',
    unidad_beneficio: 'pesos de dic-2025 por mes',
    deflactor: 'IPC INDEC (2002-2006 y 2016-2025) e IPC Bevacqua (2007-2015)',
    fuente: 'CIAS-Fundar, con base en Presupuesto Abierto (Ministerio de Economía de la Nación) y datos de ANSES y ANDIS obtenidos por pedidos de Acceso a la Información Pública.',
    fuente_poblacion: 'Población por edad y sexo: Naciones Unidas, World Population Prospects 2024 (estimaciones a mitad de año; 2024-2025, variante media).',
    fuente_pbi: 'PBI a precios corrientes: INDEC, Cuentas Nacionales (2024 provisorio, 2025 preliminar; 2002-2003 empalmado con la base 1993).',
    autores: 'Forlino, L. y Schipani, A.',
    anio_publicacion: 2026,
    titulo_documento: 'Mapa de las Políticas Sociales en la Argentina. Política social a dos velocidades: inversión estable, trayectorias divergentes',
    editorial: 'CIAS-Fundar',
    anio_base: 2023,
    // Cuando Comunicación publique el documento, pegar acá la URL (entre comillas).
    documento_url: null
  },

  anios: [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],

  // Inversión social no contributiva total (suma de las categorías de gasto, con bonos).
  total: {
    total: [4.1201, 6.4423, 6.6396, 5.9234, 6.1084, 17.8556, 19.6292, 22.5577, 27.2269, 31.0562, 34.1026, 35.9462, 35.6005, 43.7411, 42.8323, 45.4056, 42.8813, 41.1879, 60.2521, 44.8841, 48.8567, 47.6944, 40.9247, 41.4749]
  },

  // Inversión por grupo etario (Gráfico 19 del informe). Las pensiones para madres de
  // 7 o más hijos están en el total pero no en ningún grupo: la participación de cada grupo
  // se calcula sobre la suma de los tres grupos (lo que se pudo clasificar).
  grupos: [
    { id: 'ninez', nombre: 'Niñez', largo: 'Niñez',
      composicion: 'AUH, AUH por discapacidad, Asignación por Embarazo, Tarjeta/Prestación Alimentar, Plan Familias, Plan 1000 Días, el resto de las políticas alimentarias y Plan Jefes y Jefas de Hogar',
      valores: [3.4602, 5.5745, 5.14, 3.9599, 3.6031, 2.895, 2.5109, 2.0963, 3.6397, 4.2495, 4.1771, 4.5983, 4.6872, 5.5184, 5.7921, 5.5301, 6.0371, 6.021, 9.0682, 5.721, 8.9405, 7.6237, 8.6766, 9.2385] },
    { id: 'adultos', nombre: 'Jóvenes y adultos', largo: 'Jóvenes y adultos',
      composicion: 'pensiones no contributivas por invalidez, planes de cooperativas (PEC, Argentina Trabaja/PRIST, Ellas Hacen, Proyectos Productivos Comunitarios/Salario Social Complementario, Hacemos Futuro, Potenciar Trabajo, Monotributo Social, Volver al Trabajo y Acompañamiento Social), subsidios al empleo formal (REPRO, ATP, Seguro de Capacitación y Empleo, Jóvenes con Más y Mejor Trabajo, entre otros), becas PROGRESAR e IFE',
      valores: [0.3873, 0.5597, 0.9661, 1.2231, 1.4344, 1.9346, 2.2536, 3.476, 4.9867, 5.6334, 6.6096, 7.2857, 7.9331, 9.3676, 8.4647, 9.3257, 8.1462, 7.8832, 23.1888, 12.8055, 12.668, 12.8593, 7.7465, 6.563] },
    { id: 'mayores', nombre: 'Adultos mayores', largo: 'Adultos mayores',
      composicion: 'pensiones por moratoria previsional, PUAM y pensiones no contributivas por vejez',
      valores: [0.0941, 0.1026, 0.1887, 0.2748, 0.3888, 12.0577, 13.6344, 15.3711, 16.6992, 18.9512, 20.758, 21.3419, 20.384, 26.107, 26.1605, 28.1505, 26.491, 25.2307, 25.8553, 24.362, 25.2775, 25.3745, 23.0261, 24.2481] }
  ],

  // Categorías de gasto del informe. "monto" en billones de pesos constantes; "pct_pbi" en % del PBI.
  categorias: [
    { id: 'pensiones', nombre: 'Pensiones no contributivas', corto: 'Pensiones no contributivas',
      composicion: 'Pensiones no contributivas por invalidez, por vejez y para madres de 7 o más hijos, Pensión Universal para el Adulto Mayor y prestaciones por moratoria previsional (con bonos).',
      monto: [0.4519, 0.506, 0.8746, 1.2116, 1.7629, 14.0191, 16.1127, 18.7737, 20.9926, 24.5268, 27.7241, 29.2511, 28.3919, 34.8685, 34.0939, 36.2058, 33.9861, 32.2166, 33.1022, 31.4014, 32.4954, 33.0709, 29.624, 30.5616], pct_pbi: [0.0803, 0.0855, 0.1302, 0.1643, 0.2161, 1.6284, 1.8317, 2.2919, 2.3571, 2.5637, 2.9637, 3.1241, 3.0582, 3.6923, 3.6967, 3.8172, 3.4596, 3.4941, 3.9853, 3.3456, 3.3239, 3.3801, 3.2162, 3.1928] },
    { id: 'asignaciones', nombre: 'Asignaciones familiares no contributivas', corto: 'Asignaciones familiares',
      composicion: 'AUH, AUH por discapacidad y Asignación por Embarazo (partida Asignaciones familiares), Prestación Alimentar (desde noviembre de 2021), Plan Familias (partida Inclusión social), Plan 1000 Días e Ingreso Familiar de Emergencia (2020).',
      monto: [0, 0.198, 0.4852, 0.31, 0.7245, 1.132, 1.4341, 1.3657, 3.4335, 4.0536, 4.047, 4.4742, 4.5577, 5.4227, 5.6806, 5.3782, 5.8326, 5.683, 13.903, 5.5104, 8.7693, 7.4363, 8.6241, 9.1449], pct_pbi: [0.0, 0.0335, 0.0722, 0.0421, 0.0894, 0.1306, 0.1641, 0.1671, 0.3854, 0.4216, 0.4305, 0.4787, 0.4943, 0.5716, 0.6134, 0.5639, 0.6051, 0.6347, 1.663, 0.586, 0.8863, 0.7242, 0.9268, 0.9508] },
    { id: 'cooperativas', nombre: 'Planes de cooperativas / Volver al Trabajo / Acompañamiento Social', corto: 'Cooperativas',
      composicion: 'Programa de Empleo Comunitario (PEC), Argentina Trabaja (PRIST), Ellas Hacen, Proyectos Productivos Comunitarios y Salario Social Complementario, Hacemos Futuro, Potenciar Trabajo, Monotributo Social y, desde 2024, Volver al Trabajo y Acompañamiento Social.',
      monto: [0.0941, 0.0552, 0.587, 0.6882, 0.6718, 0.6605, 0.6796, 1.1762, 1.9647, 1.3565, 1.3948, 1.419, 1.5122, 1.6235, 1.5002, 2.2895, 2.5469, 2.3206, 2.5708, 4.6734, 5.8946, 5.1849, 2.0194, 1.2561], pct_pbi: [0.0183, 0.0093, 0.0875, 0.0933, 0.082, 0.0762, 0.078, 0.1459, 0.2265, 0.1447, 0.1522, 0.1535, 0.164, 0.1708, 0.1636, 0.2436, 0.2622, 0.2496, 0.3129, 0.5073, 0.6074, 0.4974, 0.2138, 0.1302] },
    { id: 'empleo', nombre: 'Subsidio para la promoción o preservación del empleo formal', corto: 'Empleo',
      composicion: 'REPRO (I, II y III), Asistencia de Emergencia al Trabajo y la Producción (ATP), Seguro de Capacitación y Empleo, Jóvenes con Más y Mejor Trabajo, Programa de Inserción Laboral, Empleo Independiente, Trabajar III y IV, Registradas, Te Sumo y Fomentar Empleo.',
      monto: [0.114, 0.3066, 0.0379, 0.0636, 0.0707, 0.281, 0.326, 0.5114, 0.63, 0.9234, 0.8066, 0.6778, 0.5506, 0.6473, 0.4336, 0.6558, 0.2569, 0.2038, 7.0582, 2.2393, 0.3377, 0.3426, 0.0643, 0.0861], pct_pbi: [0.0188, 0.0517, 0.005, 0.009, 0.0086, 0.0329, 0.037, 0.0631, 0.0707, 0.0975, 0.0854, 0.0729, 0.0598, 0.0692, 0.0474, 0.0697, 0.0262, 0.0221, 0.864, 0.2373, 0.0348, 0.0369, 0.0072, 0.0088] },
    { id: 'becas', nombre: 'Becas educativas', corto: 'Becas educativas',
      composicion: 'Becas PROGRESAR (Programa de Respaldo a Estudiantes de Argentina).',
      monto: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.4586, 1.0832, 1.0125, 0.7244, 0.0542, 0.4258, 0.3085, 0.849, 1.1886, 1.4724, 0.5405, 0.3325], pct_pbi: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0515, 0.1153, 0.1099, 0.0765, 0.0046, 0.0477, 0.0366, 0.0942, 0.1201, 0.1493, 0.058, 0.0346] },
    { id: 'alimentarias', nombre: 'Políticas alimentarias', corto: 'Políticas alimentarias',
      composicion: 'Tarjetas alimentarias y Tarjeta Alimentar (hasta octubre de 2021), Pro-Huerta, Plan Nacional de Seguridad Alimentaria y Programa Familias y Nutrición.',
      monto: [0, 0.0016, 0.0196, 0.08, 0.0949, 0.1024, 0.1424, 0.1307, 0.1369, 0.1396, 0.13, 0.1242, 0.1294, 0.0957, 0.1116, 0.1519, 0.2045, 0.3381, 3.3094, 0.2106, 0.1712, 0.1875, 0.0524, 0.0936], pct_pbi: [0.0, 0.0003, 0.0029, 0.0107, 0.0116, 0.0111, 0.0162, 0.016, 0.0156, 0.0147, 0.0143, 0.0131, 0.0142, 0.0102, 0.0123, 0.0162, 0.0224, 0.0412, 0.4057, 0.0234, 0.0176, 0.0176, 0.0065, 0.0102] },
    { id: 'jefes', nombre: 'Plan Jefes y Jefas de Hogar', corto: 'Plan Jefes y Jefas',
      composicion: 'Plan Jefes y Jefas de Hogar (híbrido entre asignaciones familiares no contributivas y planes de cooperativas).',
      monto: [3.4602, 5.3749, 4.6352, 3.5699, 2.7837, 1.6607, 0.9343, 0.6, 0.0693, 0.0563, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], pct_pbi: [0.6635, 0.9079, 0.6862, 0.4818, 0.3389, 0.1875, 0.1048, 0.0723, 0.0073, 0.0055, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] }
  ],

  // Clasificación de los programas por categoría de gasto y grupo etario (Tablas A1 y A2 del anexo
  // metodológico del Mapa 2023, actualizadas con los programas posteriores). Va a la pestaña Metodología.
  // [categoría, programa, grupo etario (null = ninguno), nota opcional]
  clasificacion: [
    ['pensiones', 'Pensiones no contributivas por invalidez', 'adultos'],
    ['pensiones', 'Pensión Universal para el Adulto Mayor (PUAM)', 'mayores'],
    ['pensiones', 'Pensiones no contributivas por vejez', 'mayores'],
    ['pensiones', 'Prestaciones previsionales por moratoria previsional', 'mayores'],
    ['pensiones', 'Pensiones no contributivas para madres de 7 o más hijos', null, 'No tiene un receptor etario claro: entra en el total pero no en los grupos etarios.'],
    ['asignaciones', 'Asignación Universal por Hijo (AUH)', 'ninez'],
    ['asignaciones', 'AUH por discapacidad', 'ninez'],
    ['asignaciones', 'Asignación Universal por Embarazo (AUE)', 'ninez'],
    ['asignaciones', 'Prestación Alimentar (desde noviembre de 2021)', 'ninez', 'Desde noviembre de 2021 se acredita junto con la AUH, por eso pasa de Políticas alimentarias a Asignaciones familiares.'],
    ['asignaciones', 'Plan Familias', 'ninez'],
    ['asignaciones', 'Plan 1000 Días', 'ninez'],
    ['asignaciones', 'Ingreso Familiar de Emergencia (IFE, 2020)', 'adultos', 'Es una asignación no contributiva, pero se dirigió a personas de 18 a 65 años sin exigir hijos.'],
    ['alimentarias', 'Tarjetas alimentarias y Tarjeta Alimentar (hasta octubre de 2021)', 'ninez'],
    ['alimentarias', 'Pro-Huerta', 'ninez', 'Integra la partida presupuestaria de Políticas alimentarias, que se asigna completa a niñez.'],
    ['alimentarias', 'Plan Nacional de Seguridad Alimentaria', 'ninez'],
    ['alimentarias', 'Programa Familias y Nutrición', 'ninez'],
    ['cooperativas', 'Programa de Empleo Comunitario (PEC)', 'adultos'],
    ['cooperativas', 'Argentina Trabaja / Programa Ingreso Social con Trabajo (PRIST)', 'adultos'],
    ['cooperativas', 'Ellas Hacen', 'adultos'],
    ['cooperativas', 'Proyectos Productivos Comunitarios / Salario Social Complementario', 'adultos'],
    ['cooperativas', 'Hacemos Futuro', 'adultos'],
    ['cooperativas', 'Potenciar Trabajo', 'adultos'],
    ['cooperativas', 'Monotributo Social', 'adultos'],
    ['cooperativas', 'Volver al Trabajo (desde 2024)', 'adultos'],
    ['cooperativas', 'Acompañamiento Social (desde 2024)', 'adultos'],
    ['empleo', 'REPRO (I, II y III)', 'adultos'],
    ['empleo', 'Asistencia de Emergencia al Trabajo y la Producción (ATP)', 'adultos'],
    ['empleo', 'Seguro de Capacitación y Empleo', 'adultos'],
    ['empleo', 'Jóvenes con Más y Mejor Trabajo', 'adultos'],
    ['empleo', 'Programa de Inserción Laboral', 'adultos'],
    ['empleo', 'Programa de Empleo Independiente', 'adultos'],
    ['empleo', 'Trabajar III y Trabajar IV', 'adultos'],
    ['empleo', 'Registradas', 'adultos'],
    ['empleo', 'Te Sumo', 'adultos'],
    ['empleo', 'Fomentar Empleo', 'adultos'],
    ['becas', 'Becas PROGRESAR', 'adultos'],
    ['jefes', 'Plan Jefes y Jefas de Hogar', 'ninez', 'Híbrido entre asignaciones familiares y planes de cooperativas, por eso es una categoría aparte. Va a niñez porque exigía niñas, niños, embarazadas o personas con discapacidad en el hogar.']
  ],

  // Cobertura por grupo de edad: beneficiarios de cada programa sobre la población del grupo (mismo
  // denominador para todos los programas del grupo, para poder apilarlos). Lo genera el script.
  cobertura_grupos: [{"id": "ninez", "nombre": "Niñez", "poblacion_txt": "niñas, niños y adolescentes de 0 a 17 años", "poblacion": [12528612, 12558332, 12586063, 12613982, 12639155, 12657984, 12682672, 12712416, 12743213, 12776346, 12795763, 12813918, 12858534, 12918758, 12963723, 12979529, 12967961, 12916347, 12793043, 12624165, 12437194, 12232294, 12027554, 11823855], "series": [{"id": "auh", "nombre": "AUH (con AUH por discapacidad y por Embarazo)", "beneficiarios": [null, null, null, null, null, null, null, 3360014.0, 3485061.0, 3586952.0, 3450493.0, 3405410.0, 3496401.0, 3639569.0, 3940958.0, 3969832.0, 4013607.0, 4118120.0, 4381145.0, 4457012.0, 4443345.0, 4268853.0, 4159147.0, 4181786.0], "cobertura": [null, null, null, null, null, null, null, 26.43, 27.35, 28.07, 26.97, 26.58, 27.19, 28.17, 30.4, 30.59, 30.95, 31.88, 34.25, 35.31, 35.73, 34.9, 34.58, 35.37]}]}, {"id": "adultos", "nombre": "Jóvenes y adultos", "poblacion_txt": "personas de 18 a 64 años", "poblacion": [21777387, 22083223, 22388205, 22694765, 23003037, 23310500, 23620725, 23935899, 24250588, 24565872, 24878968, 25183622, 25478432, 25762083, 26033443, 26301568, 26567838, 26825563, 27069242, 27287518, 27506290, 27749050, 27994965, 28234457], "series": [{"id": "invalidez", "nombre": "Pensiones por invalidez", "beneficiarios": [76899.0, 80593.0, 89407.0, 123458.0, 154694.0, 201477.0, 264311.0, 372715.0, 504946.0, 654735.0, 795775.0, 917394.0, 1018165.0, 1058835.0, 1059616.0, 1073921.0, 1055057.0, 1040461.0, 1033453.0, 1088813.0, 1130725.0, 1208487.0, 1221971.0, 1183557.0], "cobertura": [0.35, 0.36, 0.4, 0.54, 0.67, 0.86, 1.12, 1.56, 2.08, 2.67, 3.2, 3.64, 4.0, 4.11, 4.07, 4.08, 3.97, 3.88, 3.82, 3.99, 4.11, 4.36, 4.36, 4.19]}, {"id": "cooperativas", "nombre": "Planes de cooperativas", "beneficiarios": [null, null, 260754.0, 299023.0, 285980.0, 297578.0, 429489.0, 614496.0, 626912.0, 439731.0, 201956.0, 273401.0, 264803.0, 257824.0, 263667.0, 372387.0, 718463.0, 541641.0, 1169470.0, 1045352.0, 1337745.0, 1276235.0, 1197499.0, 1174688.0], "cobertura": [null, null, 1.16, 1.32, 1.24, 1.28, 1.82, 2.57, 2.59, 1.79, 0.81, 1.09, 1.04, 1.0, 1.01, 1.42, 2.7, 2.02, 4.32, 3.83, 4.86, 4.6, 4.28, 4.16]}, {"id": "progresar", "nombre": "Becas PROGRESAR", "beneficiarios": [null, null, null, null, null, null, null, null, null, null, null, null, 426625.0, 724439.0, 820900.0, 781631.0, 581546.0, 571445.0, 535927.0, 1066501.0, 1697663.0, 1659120.0, 1047999.0, 998332.0], "cobertura": [null, null, null, null, null, null, null, null, null, null, null, null, 1.67, 2.81, 3.15, 2.97, 2.19, 2.13, 1.98, 3.91, 6.17, 5.98, 3.74, 3.54]}]}, {"id": "mayores", "nombre": "Adultos mayores", "poblacion_txt": "mujeres de 60 años o más y varones de 65 años o más", "poblacion": [4458306, 4533695, 4610406, 4696075, 4788408, 4878173, 4972488, 5078063, 5184586, 5295764, 5409849, 5521415, 5637360, 5759760, 5878247, 5993099, 6112831, 6233846, 6340948, 6418068, 6488419, 6591141, 6717374, 6842789], "series": [{"id": "moratoria", "nombre": "Moratoria previsional", "beneficiarios": [null, null, null, 4833.0, 189888.0, 1386446.0, 1869126.0, 2198765.0, 2423626.0, 2548743.0, 2634232.0, 2697300.0, 2754962.0, 3241320.0, 3568742.0, 3728972.0, 3769655.0, 3805207.0, 3804486.0, 3780839.0, 3891727.0, 4024000.0, 4329041.0, 4505193.0], "cobertura": [null, null, null, 0.1, 3.97, 28.42, 37.59, 43.3, 46.75, 48.13, 48.69, 48.85, 48.87, 56.28, 60.71, 62.22, 61.67, 61.04, 60.0, 58.91, 59.98, 61.05, 64.45, 65.84]}, {"id": "puam", "nombre": "PUAM", "beneficiarios": [null, null, null, null, null, null, null, null, null, null, null, null, null, null, 976.0, 30059.0, 92311.0, 137043.0, 173297.0, 209105.0, 260300.0, 300771.0, 288028.0, 219339.0], "cobertura": [null, null, null, null, null, null, null, null, null, null, null, null, null, null, 0.02, 0.5, 1.51, 2.2, 2.73, 3.26, 4.01, 4.56, 4.29, 3.21]}, {"id": "pensiones_no_contributivas_por_vejez", "nombre": "Pensiones por vejez", "beneficiarios": [40511.0, 40996.0, 50323.0, 70947.0, 86546.0, 92652.0, 81503.0, 71065.0, 56534.0, 45815.0, 37333.0, 29358.0, 23635.0, 17282.0, 11785.0, 6091.0, 2601.0, 1980.0, 1582.0, 1336.0, 1071.0, 969.0, 730.0, 477.0], "cobertura": [0.91, 0.9, 1.09, 1.51, 1.81, 1.9, 1.64, 1.4, 1.09, 0.87, 0.69, 0.53, 0.42, 0.3, 0.2, 0.1, 0.04, 0.03, 0.02, 0.02, 0.02, 0.01, 0.01, 0.01]}]}],

  // Programas del listado desplegable. "grupo" = id del grupo etario al que se dirige.
  // "en" completa el título de los gráficos ("Gasto en ..."); "composicion" va a la pestaña Metodología.
  // "descripcion" no se muestra en el tablero. "unidad_benef": qué cuenta "beneficiarios" (por defecto, personas).
  // "notas": aclaraciones que van debajo de la fuente de cada gráfico (todas = en todos; benef, beneficio, gasto, cobertura = en ese).
  // "beneficiarios": promedio anual; "beneficio": monto mensual promedio ($ de dic-2025, con bonos).
  programas: [
    { id: 'auh', en: 'la AUH', composicion: 'Gasto: partida Asignaciones familiares (AUH, AUH por discapacidad y Asignación por Embarazo). Beneficiarios: los mismos tres programas. Beneficio: monto por hija o hijo de la AUH.',
      nombre: 'Asignación Universal por Hijo (AUH)', corto: 'AUH', grupo: 'ninez',
      descripcion: 'Transferencia mensual para hijas e hijos de personas desocupadas, en la economía informal o en el servicio doméstico.',
      notas: { todas: 'Incluye AUH, AUH por discapacidad y Asignación por Embarazo.', beneficio: 'Monto por hija o hijo de la AUH.' },
      valores: [null, null, null, null, null, null, null, 0.2016, 3.4004, 3.9884, 3.9806, 4.4117, 4.4495, 5.4227, 5.6806, 5.3782, 5.8326, 5.683, 5.7588, 5.1216, 4.6227, 3.7545, 5.2832, 6.2792], beneficiarios: [null, null, null, null, null, null, null, 3360014.0, 3485061.0, 3586952.0, 3450493.0, 3405410.0, 3496401.0, 3639569.0, 3940958.0, 3969832.0, 4013607.0, 4118120.0, 4381145.0, 4457012.0, 4443345.0, 4268853.0, 4159147.0, 4181786.0], beneficio: [null, null, null, null, null, null, null, 89822.0, 83465.0, 83628.0, 83629.0, 112129.0, 115161.0, 121093.0, 111810.0, 114110.0, 105599.0, 109781.0, 99289.0, 92226.0, 87979.0, 73746.0, 108762.0, 123310.0],
      poblacion_ref_txt: 'niñas, niños y adolescentes de 0 a 17 años', poblacion_ref: [12528612, 12558332, 12586063, 12613982, 12639155, 12657984, 12682672, 12712416, 12743213, 12776346, 12795763, 12813918, 12858534, 12918758, 12963723, 12979529, 12967961, 12916347, 12793043, 12624165, 12437194, 12232294, 12027554, 11823855], cobertura: [null, null, null, null, null, null, null, 26.43, 27.35, 28.07, 26.97, 26.58, 27.19, 28.17, 30.4, 30.59, 30.95, 31.88, 34.25, 35.31, 35.73, 34.9, 34.58, 35.37] },
    { id: 'moratoria', en: 'pensiones por moratoria previsional', composicion: 'Prestaciones previsionales por moratoria previsional, con bonos.',
      nombre: 'Pensiones por moratoria previsional', corto: 'Moratoria', grupo: 'mayores',
      descripcion: 'Jubilaciones y pensiones a las que se accede regularizando aportes faltantes mediante planes de moratoria. Incluye bonos.',
      notas: { beneficio: 'Incluye bonos.', gasto: 'Incluye bonos.' },
      valores: [null, null, null, null, null, 11.5952, 13.2429, 15.026, 16.4283, 18.713, 20.5392, 21.1696, 20.2545, 26.0084, 26.0951, 27.9118, 25.94, 24.4618, 24.8604, 23.2287, 23.8743, 23.7595, 21.7545, 23.2346], beneficiarios: [null, null, null, 4833.0, 189888.0, 1386446.0, 1869126.0, 2198765.0, 2423626.0, 2548743.0, 2634232.0, 2697300.0, 2754962.0, 3241320.0, 3568742.0, 3728972.0, 3769655.0, 3805207.0, 3804486.0, 3780839.0, 3891727.0, 4024000.0, 4329041.0, 4505193.0], beneficio: [null, null, null, 451549.0, 523977.0, 582422.0, 557635.0, 563026.0, 555012.0, 605357.0, 659867.0, 676315.0, 633108.0, 678463.0, 620536.0, 634115.0, 588884.0, 553351.0, 573935.0, 538590.0, 533980.0, 520124.0, 445085.0, 451300.0],
      poblacion_ref_txt: 'mujeres de 60 años o más y varones de 65 años o más', poblacion_ref: [4458306, 4533695, 4610406, 4696075, 4788408, 4878173, 4972488, 5078063, 5184586, 5295764, 5409849, 5521415, 5637360, 5759760, 5878247, 5993099, 6112831, 6233846, 6340948, 6418068, 6488419, 6591141, 6717374, 6842789], cobertura: [null, null, null, 0.1, 3.97, 28.42, 37.59, 43.3, 46.75, 48.13, 48.69, 48.85, 48.87, 56.28, 60.71, 62.22, 61.67, 61.04, 60.0, 58.91, 59.98, 61.05, 64.45, 65.84] },
    { id: 'invalidez', en: 'pensiones no contributivas por invalidez', composicion: 'Pensiones no contributivas por invalidez, con bonos.',
      nombre: 'Pensiones no contributivas por invalidez', corto: 'Invalidez', grupo: 'adultos',
      descripcion: 'Pensión para personas menores de 65 años que acreditan una disminución del 76% o más de su capacidad laboral. Equivale al 70% del haber jubilatorio mínimo. Incluye bonos.',
      notas: { beneficio: 'Incluye bonos.', gasto: 'Incluye bonos.' },
      valores: [0.1792, 0.198, 0.3412, 0.4713, 0.692, 0.9931, 1.248, 1.7884, 2.3921, 3.3536, 4.4081, 5.1889, 5.4116, 6.0135, 5.5184, 5.6559, 5.2882, 4.933, 5.1071, 5.0437, 5.2472, 5.8595, 5.1224, 4.8883], beneficiarios: [76899.0, 80593.0, 89407.0, 123458.0, 154694.0, 201477.0, 264311.0, 372715.0, 504946.0, 654735.0, 795775.0, 917394.0, 1018165.0, 1058835.0, 1059616.0, 1073921.0, 1055057.0, 1040461.0, 1033453.0, 1088813.0, 1130725.0, 1208487.0, 1221971.0, 1183557.0], beneficio: [189154.0, 203768.0, 305897.0, 316085.0, 366784.0, 407696.0, 392122.0, 396437.0, 391226.0, 423750.0, 461907.0, 473421.0, 443176.0, 476347.0, 434375.0, 443880.0, 412930.0, 391797.0, 408549.0, 384596.0, 387335.0, 397898.0, 344571.0, 339742.0],
      poblacion_ref_txt: 'personas de 18 a 64 años', poblacion_ref: [21777387, 22083223, 22388205, 22694765, 23003037, 23310500, 23620725, 23935899, 24250588, 24565872, 24878968, 25183622, 25478432, 25762083, 26033443, 26301568, 26567838, 26825563, 27069242, 27287518, 27506290, 27749050, 27994965, 28234457], cobertura: [0.35, 0.36, 0.4, 0.54, 0.67, 0.86, 1.12, 1.56, 2.08, 2.67, 3.2, 3.64, 4.0, 4.11, 4.07, 4.08, 3.97, 3.88, 3.82, 3.99, 4.11, 4.36, 4.36, 4.19] },
    { id: 'alimentar', en: 'la Prestación Alimentar', composicion: 'Tarjeta Alimentar (desde diciembre de 2019) y Prestación Alimentar (desde noviembre de 2021). La serie empieza en 2020, primer año completo; los datos anteriores corresponden a otras tarjetas alimentarias. Beneficiarios: familias titulares. Beneficio: monto mensual promedio por familia, que varía según la cantidad de hijos.',
      nombre: 'Prestación Alimentar', corto: 'Alimentar', grupo: 'ninez',
      descripcion: 'Transferencia para la compra de alimentos destinada a familias con niñas y niños.',
      unidad_benef: 'familias',
      notas: { todas: 'Hasta octubre de 2021, Tarjeta Alimentar.', beneficio: 'Monto promedio por familia; el monto de cada familia depende de la cantidad de hijos.' },
      valores: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 3.1506, 4.2067, 4.0575, 3.5951, 3.0771, 2.4676], beneficiarios: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1567751.0, 2057970.0, 2436495.0, 2376387.0, 2345455.0, 2543116.0], beneficio: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 173988.0, 148193.0, 129192.0, 122954.0, 104226.0, 80950.0],
      poblacion_ref_txt: null, poblacion_ref: null, cobertura: null },
    { id: 'cooperativas', en: 'planes de cooperativas', composicion: 'Gasto: categoría Planes de cooperativas / Volver al Trabajo / Acompañamiento Social. Beneficiarios: Programa de Empleo Comunitario (PEC), Argentina Trabaja y Ellas Hacen (PRIST), Proyectos Productivos Comunitarios / Salario Social Complementario, Hacemos Futuro, Potenciar Trabajo, Acompañamiento Social y Volver al Trabajo. Beneficio: promedio ponderado por beneficiarios de los programas con dato.',
      nombre: 'Planes de cooperativas', corto: 'Cooperativas', grupo: 'adultos',
      descripcion: 'Programas de transferencia con contraprestación laboral o de formación.',
      notas: { todas: 'Incluye PEC, Argentina Trabaja y Ellas Hacen (PRIST), Proyectos Productivos Comunitarios / Salario Social Complementario, Hacemos Futuro, Potenciar Trabajo y, desde 2024, Volver al Trabajo y Acompañamiento Social.', beneficio: 'Promedio de los programas vigentes, ponderado por beneficiarios.' },
      valores: [0.0941, 0.0552, 0.587, 0.6882, 0.6718, 0.6605, 0.6796, 1.1762, 1.9647, 1.3565, 1.3948, 1.419, 1.5122, 1.6235, 1.5002, 2.2895, 2.5469, 2.3206, 2.5708, 4.6734, 5.8946, 5.1849, 2.0194, 1.2561], beneficiarios: [null, null, 260754.0, 299023.0, 285980.0, 297578.0, 429489.0, 614496.0, 626912.0, 439731.0, 201956.0, 273401.0, 264803.0, 257824.0, 263667.0, 372387.0, 718463.0, 541641.0, 1169470.0, 1045352.0, 1337745.0, 1276235.0, 1197499.0, 1174688.0], beneficio: [null, null, null, null, null, null, null, 754063.0, 650604.0, 531879.0, 430237.0, 484448.0, 429217.0, 419075.0, 356575.0, 394164.0, 359576.0, 313291.0, 276516.0, 270569.0, 268316.0, 261420.0, 114343.0, 88519.0],
      poblacion_ref_txt: 'personas de 18 a 64 años', poblacion_ref: [21777387, 22083223, 22388205, 22694765, 23003037, 23310500, 23620725, 23935899, 24250588, 24565872, 24878968, 25183622, 25478432, 25762083, 26033443, 26301568, 26567838, 26825563, 27069242, 27287518, 27506290, 27749050, 27994965, 28234457], cobertura: [null, null, 1.16, 1.32, 1.24, 1.28, 1.82, 2.57, 2.59, 1.79, 0.81, 1.09, 1.04, 1.0, 1.01, 1.42, 2.7, 2.02, 4.32, 3.83, 4.86, 4.6, 4.28, 4.16] },
    { id: 'puam', en: 'la PUAM', composicion: 'Pensión Universal para el Adulto Mayor, con bonos.',
      nombre: 'Pensión Universal para el Adulto Mayor (PUAM)', corto: 'PUAM', grupo: 'mayores',
      descripcion: 'Prestación para personas de 65 años o más que no tienen jubilación ni pensión, equivalente al 80% del haber mínimo. Incluye bonos.',
      notas: { beneficio: 'Incluye bonos.', gasto: 'Incluye bonos.' },
      valores: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, 0.0017, 0.201, 0.5371, 0.7587, 0.9872, 1.1275, 1.3983, 1.6102, 1.2685, 1.0114], beneficiarios: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, 976.0, 30059.0, 92311.0, 137043.0, 173297.0, 209105.0, 260300.0, 300771.0, 288028.0, 219339.0], beneficio: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, 496429.0, 507292.0, 471581.0, 445649.0, 463678.0, 435927.0, 436216.0, 438640.0, 378076.0, 376928.0],
      poblacion_ref_txt: 'personas de 65 años o más', poblacion_ref: [3723355, 3782730, 3841650, 3908046, 3979928, 4048282, 4120764, 4206523, 4294899, 4388440, 4486994, 4584917, 4687105, 4796181, 4903150, 5007796, 5119086, 5231556, 5329690, 5400594, 5464424, 5557056, 5673640, 5793063], cobertura: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, 0.02, 0.6, 1.8, 2.62, 3.25, 3.87, 4.76, 5.41, 5.08, 3.79] },
    { id: 'progresar', en: 'becas PROGRESAR', composicion: 'Becas educativas del Programa de Respaldo a Estudiantes de Argentina.',
      nombre: 'Becas PROGRESAR', corto: 'PROGRESAR', grupo: 'adultos',
      descripcion: 'Becas para que jóvenes inicien o terminen sus estudios.',
      notas: { cobertura: 'La edad de acceso cambió con los años; se toma 18 a 24 años como referencia.' },
      valores: [null, null, null, null, null, null, null, null, null, null, null, null, 0.4586, 1.0832, 1.0125, 0.7244, 0.0542, 0.4258, 0.3085, 0.849, 1.1886, 1.4724, 0.5405, 0.3325], beneficiarios: [null, null, null, null, null, null, null, null, null, null, null, null, 426625.0, 724439.0, 820900.0, 781631.0, 581546.0, 571445.0, 535927.0, 1066501.0, 1697663.0, 1659120.0, 1047999.0, 998332.0], beneficio: [null, null, null, null, null, null, null, null, null, null, null, null, 97238.0, 108996.0, 81969.0, 77538.0, 100924.0, 90937.0, 86383.0, 94654.0, 84416.0, 68274.0, 47304.0, 39720.0],
      poblacion_ref_txt: 'jóvenes de 18 a 24 años', poblacion_ref: [4574991, 4582020, 4584507, 4589502, 4602367, 4624272, 4657292, 4700079, 4747809, 4799036, 4850088, 4892557, 4920198, 4931274, 4929658, 4926061, 4918763, 4902093, 4882151, 4866452, 4859132, 4861374, 4865110, 4867971], cobertura: [null, null, null, null, null, null, null, null, null, null, null, null, 8.67, 14.69, 16.65, 15.87, 11.82, 11.66, 10.98, 21.92, 34.94, 34.13, 21.54, 20.51] }
  ]
};
