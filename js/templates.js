// ContratosExpress.pro — Contract Templates (Offline Mode)
// by MolvicStudios
// 8 contract types: services, nda, freelance, rental, employment, partnership, sales, custom

const DISCLAIMER_ES = `⚠️ AVISO LEGAL: Este documento es una plantilla orientativa generada automáticamente. NO constituye asesoramiento legal profesional. Para contratos vinculantes, consulta siempre con un abogado colegiado en tu jurisdicción. El uso de este documento es bajo tu propia responsabilidad.`;

const DISCLAIMER_EN = `⚠️ LEGAL NOTICE: This document is an automatically generated guidance template. It does NOT constitute professional legal advice. For binding contracts, always consult with a licensed attorney in your jurisdiction. Use of this document is at your own risk.`;

function genRef() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `CE-${y}${m}${d}-${rand}`;
}

function formatDate(lang) {
  const now = new Date();
  if (lang === 'en') {
    return now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return now.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function partyBlock(data, lang) {
  const isEs = lang !== 'en';
  const p1type = data.party1Type === 'company'
    ? (isEs ? 'Persona jurídica' : 'Legal entity')
    : (isEs ? 'Persona física' : 'Individual');
  const p2type = data.party2Type === 'company'
    ? (isEs ? 'Persona jurídica' : 'Legal entity')
    : (isEs ? 'Persona física' : 'Individual');

  if (isEs) {
    return `COMPARECIENTES

De una parte: ${data.party1Name}${data.party1TaxId ? `, con identificación fiscal ${data.party1TaxId}` : ''}, ${p1type}${data.party1Address ? `, con domicilio en ${data.party1Address}` : ''}${data.party1Email ? `, correo electrónico: ${data.party1Email}` : ''}. En adelante, "LA PRIMERA PARTE".

De otra parte: ${data.party2Name}${data.party2TaxId ? `, con identificación fiscal ${data.party2TaxId}` : ''}, ${p2type}${data.party2Address ? `, con domicilio en ${data.party2Address}` : ''}${data.party2Email ? `, correo electrónico: ${data.party2Email}` : ''}. En adelante, "LA SEGUNDA PARTE".

Ambas partes, en pleno ejercicio de su capacidad legal, libre y voluntariamente,`;
  } else {
    return `PARTIES

First Party: ${data.party1Name}${data.party1TaxId ? `, Tax ID: ${data.party1TaxId}` : ''}, ${p1type}${data.party1Address ? `, address: ${data.party1Address}` : ''}${data.party1Email ? `, email: ${data.party1Email}` : ''}. Hereinafter referred to as "THE FIRST PARTY".

Second Party: ${data.party2Name}${data.party2TaxId ? `, Tax ID: ${data.party2TaxId}` : ''}, ${p2type}${data.party2Address ? `, address: ${data.party2Address}` : ''}${data.party2Email ? `, email: ${data.party2Email}` : ''}. Hereinafter referred to as "THE SECOND PARTY".

Both parties, in full exercise of their legal capacity, freely and voluntarily,`;
  }
}

function economicBlock(data, lang) {
  const isEs = lang !== 'en';
  const paymentLabels = {
    es: {
      single_start: 'Pago único al inicio del contrato',
      single_end: 'Pago único al finalizar el trabajo',
      split_50: '50% de anticipo y 50% al finalizar',
      monthly: 'Pagos mensuales',
      milestones: 'Por hitos o entregables',
      custom: 'Forma de pago personalizada',
    },
    en: {
      single_start: 'Single payment upfront',
      single_end: 'Single payment upon completion',
      split_50: '50% upfront and 50% upon completion',
      monthly: 'Monthly payments',
      milestones: 'By milestones or deliverables',
      custom: 'Custom payment schedule',
    },
  };
  const payLabel = (paymentLabels[isEs ? 'es' : 'en'][data.paymentType]) || data.paymentType || '';
  if (isEs) {
    return `TERCERA. Precio y Forma de Pago.

El precio acordado por la totalidad de los servicios/bienes objeto del presente contrato es de ${data.price}${data.currency ? ` (${data.currency})` : ''}.

Forma de pago: ${payLabel}.${data.paymentMethod ? `\nMétodo de pago: ${data.paymentMethod}.` : ''}${data.latePenalty ? `\nPenalización por retraso en el pago: ${data.latePenalty}.` : ''}${data.breachPenalty ? `\nPenalización por incumplimiento contractual: ${data.breachPenalty}.` : ''}`;
  } else {
    return `THIRD. Price and Payment Terms.

The agreed price for all services/goods subject to this contract is ${data.price}${data.currency ? ` (${data.currency})` : ''}.

Payment schedule: ${payLabel}.${data.paymentMethod ? `\nPayment method: ${data.paymentMethod}.` : ''}${data.latePenalty ? `\nLate payment penalty: ${data.latePenalty}.` : ''}${data.breachPenalty ? `\nBreach of contract penalty: ${data.breachPenalty}.` : ''}`;
  }
}

function durationBlock(data, lang) {
  const isEs = lang !== 'en';
  if (isEs) {
    return `CUARTA. Duración y Plazos.

${data.startDate ? `El presente contrato tendrá vigencia a partir del ${data.startDate}.` : 'El presente contrato entrará en vigor en la fecha de su firma.'}${data.duration ? `\nDuración o fecha de finalización: ${data.duration}.` : ''}

Salvo pacto en contrario, cualquiera de las partes podrá dar por terminado el presente contrato mediante notificación escrita con la antelación que se establezca en las cláusulas de terminación.`;
  } else {
    return `FOURTH. Term and Deadlines.

${data.startDate ? `This agreement shall be effective as of ${data.startDate}.` : 'This agreement shall take effect on the date of signature.'}${data.duration ? `\nDuration or end date: ${data.duration}.` : ''}

Unless otherwise agreed, either party may terminate this agreement by written notice with the advance notice established in the termination clauses.`;
  }
}

function optionalClausesBlock(data, lang) {
  const isEs = lang !== 'en';
  const clauses = [];

  if (data.clauseConfidentiality) {
    clauses.push(isEs
      ? `CLÁUSULA DE CONFIDENCIALIDAD. Las partes se comprometen a mantener en estricta confidencialidad toda la información, documentación, datos técnicos, comerciales o de cualquier otra naturaleza que sea revelada con ocasión del presente contrato, absteniéndose de divulgarla a terceros sin consentimiento escrito previo de la otra parte. Esta obligación subsistirá durante la vigencia del contrato y por un período de dos (2) años tras su finalización.`
      : `CONFIDENTIALITY CLAUSE. The parties agree to keep strictly confidential all information, documentation, technical or commercial data of any nature disclosed in connection with this agreement, refraining from disclosing it to third parties without prior written consent of the other party. This obligation shall survive termination of this agreement for a period of two (2) years.`);
  }

  if (data.clauseNonCompete) {
    clauses.push(isEs
      ? `CLÁUSULA DE NO COMPETENCIA. Durante la vigencia del contrato${data.nonCompetePeriod ? ` y por un período de ${data.nonCompetePeriod} tras su finalización` : ''}, LA SEGUNDA PARTE se obliga a no realizar, directa ni indirectamente, actividades que compitan con el objeto principal del negocio de LA PRIMERA PARTE, ni a colaborar con competidores directos sin autorización expresa y escrita.`
      : `NON-COMPETE CLAUSE. During the term of this agreement${data.nonCompetePeriod ? ` and for a period of ${data.nonCompetePeriod} following its termination` : ''}, THE SECOND PARTY agrees not to engage, directly or indirectly, in activities that compete with the main business of THE FIRST PARTY, nor to collaborate with direct competitors without prior express written authorization.`);
  }

  if (data.clauseIPRights) {
    clauses.push(isEs
      ? `CLÁUSULA DE PROPIEDAD INTELECTUAL. Todos los trabajos, creaciones, diseños, códigos, documentos, desarrollos o cualquier otro resultado intelectual producido en el marco de este contrato serán propiedad de LA PRIMERA PARTE desde el momento de su creación, salvo acuerdo expreso en contrario. LA SEGUNDA PARTE cede todos los derechos de autor, derechos de explotación y cualquier otro derecho de propiedad intelectual relacionado con dichos resultados.`
      : `INTELLECTUAL PROPERTY CLAUSE. All works, creations, designs, codes, documents, developments, or any other intellectual output produced under this agreement shall be the property of THE FIRST PARTY from the moment of their creation, unless expressly agreed otherwise. THE SECOND PARTY assigns all copyrights, exploitation rights, and any other intellectual property rights related to such outputs.`);
  }

  if (data.clauseDisputeResolution) {
    clauses.push(isEs
      ? `CLÁUSULA DE RESOLUCIÓN DE DISPUTAS. Cualquier controversia o reclamación derivada del presente contrato se resolverá mediante el siguiente procedimiento escalonado: (1) Negociación directa entre las partes en un plazo de 30 días desde la notificación del conflicto; (2) En caso de no acuerdo, mediación ante un mediador neutral designado de común acuerdo; (3) Si la mediación fracasa, arbitraje de derecho conforme a la legislación aplicable; (4) Como última instancia, los tribunales competentes de la jurisdicción pactada.`
      : `DISPUTE RESOLUTION CLAUSE. Any dispute or claim arising from this agreement shall be resolved through the following stepped procedure: (1) Direct negotiation between the parties within 30 days from notice of the dispute; (2) If no agreement is reached, mediation before a neutral mediator jointly appointed; (3) If mediation fails, legal arbitration under applicable law; (4) As a last resort, the competent courts of the agreed jurisdiction.`);
  }

  if (data.clauseEarlyTermination) {
    clauses.push(isEs
      ? `CLÁUSULA DE TERMINACIÓN ANTICIPADA. Cualquiera de las partes podrá resolver el presente contrato antes de su vencimiento mediante notificación escrita${data.earlyTerminationNotice ? ` con un preaviso mínimo de ${data.earlyTerminationNotice}` : ' con preaviso razonable por escrito'}. En caso de resolución anticipada sin causa justificada, la parte que resuelva deberá indemnizar a la otra por los daños y perjuicios efectivamente causados.`
      : `EARLY TERMINATION CLAUSE. Either party may terminate this agreement prior to its expiration by written notice${data.earlyTerminationNotice ? ` with a minimum notice period of ${data.earlyTerminationNotice}` : ' with reasonable written notice'}. In the event of early termination without justified cause, the terminating party shall indemnify the other for damages actually caused.`);
  }

  if (data.clauseForceMajeure) {
    clauses.push(isEs
      ? `CLÁUSULA DE FUERZA MAYOR. Ninguna de las partes será responsable por el incumplimiento total o parcial de sus obligaciones cuando dicho incumplimiento sea consecuencia de causas de fuerza mayor o caso fortuito, entendiendo por tales: guerre, disturbios civiles, terremotos, inundaciones, pandemias, huelgas generales, actos de autoridad gubernamental o cualquier evento de carácter extraordinario, inevitable e imprevisible. La parte afectada deberá notificarlo a la otra con la mayor diligencia posible y adoptar las medidas razonables para minimizar los efectos.`
      : `FORCE MAJEURE CLAUSE. Neither party shall be liable for total or partial failure to perform its obligations when such failure is caused by force majeure or fortuitous events, meaning: war, civil unrest, earthquakes, floods, pandemics, general strikes, acts of governmental authority, or any extraordinary, inevitable and unforeseeable event. The affected party must notify the other as promptly as possible and take reasonable measures to minimize the effects.`);
  }

  if (data.clauseDataProtection) {
    clauses.push(isEs
      ? `CLÁUSULA DE PROTECCIÓN DE DATOS PERSONALES. Las partes se comprometen a tratar los datos personales que intercambien con ocasión del presente contrato de conformidad con la normativa aplicable en materia de protección de datos (RGPD, LOPDGDD o equivalente en la jurisdicción aplicable). Cada parte actuará como responsable del tratamiento de los datos de sus propios clientes y empleados, tomando las medidas técnicas y organizativas necesarias para garantizar su seguridad e integridad. Los datos no serán cedidos a terceros sin consentimiento expreso.`
      : `PERSONAL DATA PROTECTION CLAUSE. The parties agree to process personal data exchanged in connection with this agreement in compliance with applicable data protection regulations (GDPR, CCPA, or equivalent in the applicable jurisdiction). Each party shall act as controller of its own clients' and employees' data, implementing the necessary technical and organizational measures to ensure security and integrity. Data shall not be transferred to third parties without express consent.`);
  }

  if (clauses.length === 0) return '';
  return (isEs ? '\nCLÁUSULAS ADICIONALES\n\n' : '\nADDITIONAL CLAUSES\n\n') + clauses.join('\n\n');
}

function jurisdictionBlock(data, lang) {
  const isEs = lang !== 'en';
  const jur = data.jurisdiction || (isEs ? 'España' : 'the applicable jurisdiction');
  if (isEs) {
    return `LEY APLICABLE Y JURISDICCIÓN

El presente contrato se regirá e interpretará de conformidad con las leyes de ${jur}. Para cualquier controversia que no pueda resolverse amistosamente, ambas partes se someten expresamente a los tribunales competentes de ${jur}, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.`;
  } else {
    return `APPLICABLE LAW AND JURISDICTION

This agreement shall be governed by and construed in accordance with the laws of ${jur}. For any dispute that cannot be resolved amicably, both parties expressly submit to the competent courts of ${jur}, expressly waiving any other jurisdiction that may apply to them.`;
  }
}

function signaturesBlock(data, lang) {
  const isEs = lang !== 'en';
  const date = formatDate(lang);
  if (isEs) {
    return `DISPOSICIONES FINALES

El presente contrato se firma en dos (2) ejemplares originales de idéntico valor probatorio, uno para cada parte. Cualquier modificación deberá constar por escrito y ser firmada por ambas partes.

FIRMAS

En ________________, a ${date}.


LA PRIMERA PARTE                                LA SEGUNDA PARTE

${data.party1Name}                              ${data.party2Name}

Firma: ______________________________           Firma: ______________________________

Nombre: ____________________________           Nombre: ____________________________

Fecha: ______________________________           Fecha: ______________________________`;
  } else {
    return `FINAL PROVISIONS

This agreement is signed in two (2) original copies of equal probative value, one for each party. Any modification must be in writing and signed by both parties.

SIGNATURES

In ________________, on ${date}.


THE FIRST PARTY                                 THE SECOND PARTY

${data.party1Name}                              ${data.party2Name}

Signature: ___________________________          Signature: ___________________________

Name: _______________________________          Name: _______________________________

Date: ________________________________          Date: _________________________________`;
  }
}

// ─── TEMPLATE: SERVICES ──────────────────────────────────────────────────────
function buildServicesContract(data, lang) {
  const isEs = lang !== 'en';
  const ref = genRef();
  const disclaimer = isEs ? DISCLAIMER_ES : DISCLAIMER_EN;
  const parties = partyBlock(data, lang);
  const economic = economicBlock(data, lang);
  const duration = durationBlock(data, lang);
  const optional = optionalClausesBlock(data, lang);
  const jurisdiction = jurisdictionBlock(data, lang);
  const signatures = signaturesBlock(data, lang);

  if (isEs) {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTRATO DE PRESTACIÓN DE SERVICIOS
Ref.: ${ref}
Fecha: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

ACUERDAN suscribir el presente CONTRATO DE PRESTACIÓN DE SERVICIOS con arreglo a las siguientes:

CLÁUSULAS

PRIMERA. Objeto del Contrato.

${data.party2Name} (prestador del servicio) se compromete a prestar a ${data.party1Name} (cliente) los siguientes servicios: ${data.description}.${data.deliverables ? `\n\nEntregables y alcance específico: ${data.deliverables}.` : ''}${data.exclusions ? `\n\nExclusiones expresas del contrato: ${data.exclusions}.` : ''}

SEGUNDA. Nivel de Servicio y Aceptación.

El prestador realizará los servicios con la diligencia profesional exigible, de conformidad con los estándares del sector. Los entregables serán sometidos a revisión por el cliente, quien dispondrá de cinco (5) días hábiles desde su recepción para comunicar observaciones por escrito. Transcurrido dicho plazo sin objeciones, se entenderán aceptados. Se incluye una (1) ronda de revisiones menores sin coste adicional.

${economic}

${duration}

QUINTA. Obligaciones del Prestador de Servicios.

El prestador se obliga a: (a) ejecutar los servicios con profesionalidad y calidad; (b) mantener informado al cliente sobre el avance; (c) comunicar con antelación cualquier circunstancia que pudiera afectar a los plazos; (d) no subcontratar sin autorización expresa del cliente; (e) guardar confidencialidad sobre la información del cliente.

SEXTA. Obligaciones del Cliente.

El cliente se obliga a: (a) facilitar al prestador toda la información y accesos necesarios para la correcta ejecución del servicio; (b) abonar las cantidades pactadas en los plazos establecidos; (c) designar un interlocutor para la coordinación del proyecto; (d) aprobar o rechazar entregables en los plazos acordados.

SÉPTIMA. Garantía del Trabajo.

El prestador garantiza que los trabajos entregados estarán libres de defectos materiales y cumplirán con las especificaciones acordadas. En caso de defecto, el prestador dispondrá de un plazo razonable para subsanarlo sin coste adicional. Esta garantía no cubre modificaciones realizadas por terceros o uso inadecuado.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  } else {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SERVICE AGREEMENT
Ref.: ${ref}
Date: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

AGREE to enter into this SERVICE AGREEMENT in accordance with the following:

CLAUSES

FIRST. Subject Matter.

${data.party2Name} (service provider) agrees to provide ${data.party1Name} (client) with the following services: ${data.description}.${data.deliverables ? `\n\nDeliverables and specific scope: ${data.deliverables}.` : ''}${data.exclusions ? `\n\nExpress exclusions from this agreement: ${data.exclusions}.` : ''}

SECOND. Service Level and Acceptance.

The provider shall perform services with the required professional diligence, in accordance with industry standards. Deliverables will be reviewed by the client, who shall have five (5) business days from receipt to communicate observations in writing. After such period without objection, deliverables shall be deemed accepted. One (1) round of minor revisions is included at no additional cost.

${economic}

${duration}

FIFTH. Service Provider Obligations.

The provider agrees to: (a) perform services professionally and with quality; (b) keep the client informed of progress; (c) communicate in advance any circumstance that may affect deadlines; (d) not subcontract without the client's express authorization; (e) maintain confidentiality over client information.

SIXTH. Client Obligations.

The client agrees to: (a) provide the provider with all information and access necessary for proper service delivery; (b) pay the agreed amounts within established deadlines; (c) designate a point of contact for project coordination; (d) approve or reject deliverables within agreed timeframes.

SEVENTH. Work Warranty.

The provider warrants that delivered work will be free from material defects and will comply with the agreed specifications. In case of defect, the provider shall have a reasonable period to remedy it at no additional cost. This warranty does not cover modifications made by third parties or improper use.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// ─── TEMPLATE: NDA ───────────────────────────────────────────────────────────
function buildNdaContract(data, lang) {
  const isEs = lang !== 'en';
  const ref = genRef();
  const disclaimer = isEs ? DISCLAIMER_ES : DISCLAIMER_EN;
  const parties = partyBlock(data, lang);
  const optional = optionalClausesBlock(data, lang);
  const jurisdiction = jurisdictionBlock(data, lang);
  const signatures = signaturesBlock(data, lang);

  if (isEs) {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACUERDO DE CONFIDENCIALIDAD (NDA)
Non-Disclosure Agreement
Ref.: ${ref}
Fecha: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

ACUERDAN celebrar el presente ACUERDO DE CONFIDENCIALIDAD con arreglo a las siguientes:

CLÁUSULAS

PRIMERA. Objeto y Propósito.

Las partes desean ${data.description}. Con el fin de posibilitar dicha colaboración, será necesario compartir información confidencial. El presente acuerdo regula las condiciones bajo las cuales dicha información podrá ser divulgada, utilizada y protegida.

SEGUNDA. Definición de Información Confidencial.

Se considera "Información Confidencial" toda la información, en cualquier forma o soporte, que una parte (la "Parte Divulgadora") revele a la otra (la "Parte Receptora") y que esté marcada como confidencial o que, por su naturaleza, deba razonablemente considerarse confidencial. Esto incluye, sin limitación: datos técnicos, comerciales, financieros, operativos, estratégicos, listas de clientes, código fuente, fórmulas, procesos, diseños, planes de negocio, y cualquier información relacionada con el objeto del acuerdo.${data.deliverables ? `\n\nInformación específica objeto de este acuerdo: ${data.deliverables}.` : ''}

TERCERA. Excepciones a la Confidencialidad.

Las obligaciones de confidencialidad no se aplicarán a información que: (a) sea o se convierta en información de dominio público sin culpa de la Parte Receptora; (b) la Parte Receptora pueda demostrar que ya conocía con anterioridad a la fecha de divulgación; (c) sea divulgada por un tercero con derecho a hacerlo; (d) deba ser revelada por imperativo legal o mandato judicial, siempre que se notifique previamente a la Parte Divulgadora.

CUARTA. Obligaciones de la Parte Receptora.

La Parte Receptora se obliga a: (a) usar la Información Confidencial exclusivamente para el propósito establecido en la Cláusula Primera; (b) no divulgarla a terceros sin consentimiento previo y escrito; (c) protegerla con el mismo grado de diligencia que aplica a su propia información confidencial, y como mínimo con medidas razonables; (d) limitar el acceso a aquellos empleados o colaboradores que lo necesiten estrictamente para el propósito acordado, previa firma de compromisos de confidencialidad equivalentes.

QUINTA. Duración de la Obligación.

${data.duration ? `La obligación de confidencialidad tendrá una duración de ${data.duration} a partir de la fecha de este acuerdo.` : 'La obligación de confidencialidad tendrá una duración de dos (2) años a partir de la fecha de este acuerdo, salvo que las partes acuerden un período distinto por escrito.'}

SEXTA. Devolución y Destrucción de Materiales.

A la terminación o resolución del presente acuerdo, o a requerimiento de la Parte Divulgadora, la Parte Receptora se obliga a devolver o destruir de forma segura todos los documentos, soportes y copias que contengan Información Confidencial, y a certificar dicha destrucción por escrito si así se solicita.

SÉPTIMA. Penalización por Incumplimiento.

${data.breachPenalty ? `En caso de violación de las obligaciones de confidencialidad, la Parte Receptora se compromete a indemnizar a la Parte Divulgadora según lo siguiente: ${data.breachPenalty}.` : 'El incumplimiento de las obligaciones de confidencialidad dará derecho a la Parte Divulgadora a reclamar todos los daños y perjuicios que acredite haber sufrido, incluyendo lucro cesante y daño emergente, pudiendo solicitar medidas cautelares urgentes ante los tribunales competentes.'} Adicionalmente, la Parte Perjudicada tendrá derecho a resolver inmediatamente el acuerdo y cualquier contrato vinculado.

OCTAVA. Ausencia de Cesión de Derechos.

El presente acuerdo no implica la cesión, licencia o transferencia de ningún derecho de propiedad intelectual o industrial sobre la Información Confidencial. Todos los derechos quedan reservados en favor de la Parte Divulgadora.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  } else {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NON-DISCLOSURE AGREEMENT (NDA)
Ref.: ${ref}
Date: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

AGREE to enter into this NON-DISCLOSURE AGREEMENT in accordance with the following:

CLAUSES

FIRST. Purpose.

The parties wish to ${data.description}. To enable such collaboration, it will be necessary to share confidential information. This agreement governs the conditions under which such information may be disclosed, used and protected.

SECOND. Definition of Confidential Information.

"Confidential Information" means all information, in any form or medium, that one party (the "Disclosing Party") discloses to the other (the "Receiving Party") and which is marked as confidential or which, by its nature, should reasonably be considered confidential. This includes, without limitation: technical, commercial, financial, operational, strategic data, client lists, source code, formulas, processes, designs, business plans, and any information related to the purpose of this agreement.${data.deliverables ? `\n\nSpecific information subject to this agreement: ${data.deliverables}.` : ''}

THIRD. Exceptions to Confidentiality.

Confidentiality obligations shall not apply to information that: (a) is or becomes public domain without fault of the Receiving Party; (b) the Receiving Party can demonstrate it already knew prior to the disclosure date; (c) is disclosed by a third party with the right to do so; (d) must be disclosed by law or court order, provided prior notice is given to the Disclosing Party.

FOURTH. Receiving Party Obligations.

The Receiving Party agrees to: (a) use Confidential Information solely for the purpose set out in Clause First; (b) not disclose it to third parties without prior written consent; (c) protect it with the same degree of care it applies to its own confidential information, and at minimum with reasonable measures; (d) limit access to employees or collaborators who strictly need it for the agreed purpose, after signing equivalent confidentiality commitments.

FIFTH. Duration of Obligation.

${data.duration ? `The confidentiality obligation shall last ${data.duration} from the date of this agreement.` : 'The confidentiality obligation shall last two (2) years from the date of this agreement, unless the parties agree on a different period in writing.'}

SIXTH. Return and Destruction of Materials.

Upon termination of this agreement, or upon request by the Disclosing Party, the Receiving Party must return or securely destroy all documents, media and copies containing Confidential Information, and certify such destruction in writing if requested.

SEVENTH. Penalty for Breach.

${data.breachPenalty ? `In case of violation of confidentiality obligations, the Receiving Party agrees to indemnify the Disclosing Party as follows: ${data.breachPenalty}.` : "Breach of confidentiality obligations shall entitle the Disclosing Party to claim all damages proven to have been suffered, including lost profits and direct losses, and to seek urgent interim measures from competent courts."} Additionally, the Injured Party shall have the right to immediately terminate the agreement and any related contracts.

EIGHTH. No Transfer of Rights.

This agreement does not imply any assignment, license or transfer of any intellectual or industrial property rights over the Confidential Information. All rights remain reserved in favor of the Disclosing Party.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// ─── TEMPLATE: FREELANCE ─────────────────────────────────────────────────────
function buildFreelanceContract(data, lang) {
  const isEs = lang !== 'en';
  const ref = genRef();
  const disclaimer = isEs ? DISCLAIMER_ES : DISCLAIMER_EN;
  const parties = partyBlock(data, lang);
  const economic = economicBlock(data, lang);
  const duration = durationBlock(data, lang);
  const optional = optionalClausesBlock(data, lang);
  const jurisdiction = jurisdictionBlock(data, lang);
  const signatures = signaturesBlock(data, lang);

  if (isEs) {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTRATO DE TRABAJO FREELANCE / AUTÓNOMO
Ref.: ${ref}
Fecha: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

ACUERDAN celebrar el presente CONTRATO DE TRABAJO FREELANCE con arreglo a las siguientes:

CLÁUSULAS

PRIMERA. Objeto del Trabajo.

${data.party2Name} (el freelancer), como profesional independiente, acuerda realizar para ${data.party1Name} (el cliente) el siguiente trabajo: ${data.description}.${data.deliverables ? `\n\nEntregables concretos: ${data.deliverables}.` : ''}${data.exclusions ? `\n\nQueda expresamente excluido del alcance de este contrato: ${data.exclusions}.` : ''}

SEGUNDA. Naturaleza de la Relación — Independencia Profesional.

Las partes declaran expresamente que el freelancer actúa en todo momento como profesional independiente y autónomo, y NO como empleado, socio, agente o representante del cliente. No existe entre las partes ninguna relación laboral. El freelancer utilizará sus propias herramientas, gestiona su propio tiempo y puede trabajar para otros clientes, siempre que no haya conflicto de intereses. El freelancer será el único responsable del pago de sus impuestos, cotizaciones y obligaciones fiscales.

TERCERA. Propiedad del Trabajo y Derechos.

Salvo acuerdo expreso en contrario, todos los trabajos, entregables, diseños, código, contenidos y creaciones producidos en el marco de este contrato pasarán a ser propiedad exclusiva del cliente una vez que el pago acordado haya sido satisfecho en su totalidad. Hasta dicho momento, el freelancer conserva todos los derechos sobre su trabajo. El freelancer podrá incluir referencias genéricas al proyecto en su portfolio, previa consulta con el cliente.

${economic}

QUINTA. Facturación y Fiscalidad.

El freelancer emitirá facturas conforme a los períodos o hitos acordados en la forma de pago. El freelancer es responsable exclusivo de la gestión fiscal de su actividad profesional, incluyendo pero no limitado a: IVA, IRPF, impuesto de sociedades o equivalentes en su jurisdicción. El cliente no asumirá retenciones más allá de las que legalmente le correspondan.

${duration}

SÉPTIMA. Entrega, Revisiones y Aceptación.

El freelancer entregará los trabajos en los plazos acordados. Se contemplan un máximo de dos (2) rondas de revisiones sin coste adicional, siempre que las solicitudes estén dentro del alcance original definido. Cambios de alcance podrán suponer un ajuste del precio mediante presupuesto adicional.

OCTAVA. Confidencialidad.

El freelancer se compromete a mantener en estricta confidencialidad toda la información, datos, proyectos y secretos empresariales del cliente a los que tenga acceso en el marco de este contrato.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  } else {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FREELANCE CONTRACT
Ref.: ${ref}
Date: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

AGREE to enter into this FREELANCE CONTRACT in accordance with the following:

CLAUSES

FIRST. Scope of Work.

${data.party2Name} (the freelancer), as an independent professional, agrees to perform for ${data.party1Name} (the client) the following work: ${data.description}.${data.deliverables ? `\n\nSpecific deliverables: ${data.deliverables}.` : ''}${data.exclusions ? `\n\nExpressly excluded from the scope of this agreement: ${data.exclusions}.` : ''}

SECOND. Nature of Relationship — Independent Contractor.

The parties expressly declare that the freelancer acts at all times as an independent contractor and NOT as an employee, partner, agent or representative of the client. There is no employment relationship between the parties. The freelancer uses their own tools, manages their own time and may work for other clients, provided there is no conflict of interest. The freelancer is solely responsible for paying their own taxes, contributions and fiscal obligations.

THIRD. Ownership and Rights.

Unless expressly agreed otherwise, all work, deliverables, designs, code, content and creations produced under this agreement shall become the exclusive property of the client once the agreed payment has been made in full. Until then, the freelancer retains all rights over their work. The freelancer may include generic references to the project in their portfolio after consulting the client.

${economic}

FIFTH. Invoicing and Tax.

The freelancer shall issue invoices in accordance with the payment periods or milestones agreed. The freelancer is solely responsible for managing their own professional tax obligations, including but not limited to: VAT, income tax, self-employment tax, or equivalent in their jurisdiction. The client shall not assume any withholding beyond those legally required.

${duration}

SEVENTH. Delivery, Revisions and Acceptance.

The freelancer shall deliver work within the agreed deadlines. A maximum of two (2) revision rounds are included at no additional cost, provided requests fall within the original defined scope. Scope changes may result in a price adjustment through an additional quote.

EIGHTH. Confidentiality.

The freelancer agrees to keep strictly confidential all information, data, projects and business secrets of the client accessed under this agreement.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// ─── TEMPLATE: RENTAL ────────────────────────────────────────────────────────
function buildRentalContract(data, lang) {
  const isEs = lang !== 'en';
  const ref = genRef();
  const disclaimer = isEs ? DISCLAIMER_ES : DISCLAIMER_EN;
  const parties = partyBlock(data, lang);
  const economic = economicBlock(data, lang);
  const duration = durationBlock(data, lang);
  const optional = optionalClausesBlock(data, lang);
  const jurisdiction = jurisdictionBlock(data, lang);
  const signatures = signaturesBlock(data, lang);

  if (isEs) {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTRATO DE ARRENDAMIENTO
Ref.: ${ref}
Fecha: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

ACUERDAN celebrar el presente CONTRATO DE ARRENDAMIENTO con arreglo a las siguientes:

CLÁUSULAS

PRIMERA. Objeto del Arrendamiento.

${data.party1Name} (el arrendador) cede en arrendamiento a ${data.party2Name} (el arrendatario) el siguiente bien inmueble o espacio: ${data.description}.${data.deliverables ? `\n\nCaracterísticas y detalles del inmueble: ${data.deliverables}.` : ''}

SEGUNDA. Uso Permitido.

El arrendatario se compromete a destinar el inmueble exclusivamente al uso ${data.exclusions ? `acordado, con las siguientes restricciones: ${data.exclusions}.` : 'establecido en el contrato, sin alteraciones de uso sin consentimiento previo del arrendador.'} Queda expresamente prohibida la subarrendación total o parcial sin autorización escrita del arrendador.

TERCERA. Depósito de Garantía.

Las partes acuerdan constituir un depósito de garantía equivalente a una (1) o dos (2) mensualidades de renta, según lo acordado. Dicho depósito quedará en poder del arrendador durante la vigencia del contrato. A la finalización, será devuelto al arrendatario en un plazo máximo de treinta (30) días, previa verificación del estado del inmueble y descontando, en su caso, los importes de desperfectos imputables al arrendatario o rentas pendientes.

${economic}

${duration}

SEXTA. Mantenimiento y Conservación.

El arrendatario se obliga a mantener el inmueble en buen estado de conservación, realizando a su cargo las reparaciones de carácter ordinario y las derivadas del uso normal. Las reparaciones estructurales o de gran entidad serán a cargo del arrendador, salvo que sean consecuencia de un mal uso por parte del arrendatario.

SÉPTIMA. Devolución del Inmueble.

A la finalización del contrato, el arrendatario deberá devolver el inmueble en el mismo estado en que lo recibió, salvo el desgaste natural por uso ordinario. Deberá entregar las llaves y accesos en la fecha acordada. El incumplimiento de esta obligación facultará al arrendador a retener el depósito de garantía y a reclamar daños adicionales.

OCTAVA. Suministros y Gastos.

${data.notes ? data.notes : 'Los suministros (agua, luz, gas, internet) y gastos comunitarios correrán por cuenta del arrendatario, salvo pacto en contrario.'} Cualquier impago podrá dar lugar a la resolución del contrato por el mecanismo establecido en la legislación aplicable.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  } else {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RENTAL AGREEMENT
Ref.: ${ref}
Date: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

AGREE to enter into this RENTAL AGREEMENT in accordance with the following:

CLAUSES

FIRST. Subject of the Rental.

${data.party1Name} (the landlord) leases to ${data.party2Name} (the tenant) the following real estate property or space: ${data.description}.${data.deliverables ? `\n\nProperty features and details: ${data.deliverables}.` : ''}

SECOND. Permitted Use.

The tenant agrees to use the property exclusively for the ${data.exclusions ? `agreed purpose, with the following restrictions: ${data.exclusions}.` : 'purpose established in this agreement, without changes of use without prior landlord consent.'} Subletting in whole or in part is expressly prohibited without written authorization from the landlord.

THIRD. Security Deposit.

The parties agree to establish a security deposit equivalent to one (1) or two (2) months' rent, as agreed. Said deposit shall be held by the landlord during the term of the agreement. Upon termination, it shall be returned to the tenant within a maximum of thirty (30) days, following inspection of the property and deducting, if applicable, amounts for damages attributable to the tenant or outstanding rent.

${economic}

${duration}

SIXTH. Maintenance and Upkeep.

The tenant agrees to maintain the property in good condition, performing at their expense ordinary repairs and those arising from normal use. Structural or major repairs shall be borne by the landlord, unless resulting from misuse by the tenant.

SEVENTH. Return of Property.

Upon termination of the agreement, the tenant must return the property in the same condition as received, except for normal wear and tear. Keys and access must be delivered on the agreed date. Failure to comply will entitle the landlord to retain the security deposit and claim additional damages.

EIGHTH. Utilities and Expenses.

${data.notes ? data.notes : 'Utilities (water, electricity, gas, internet) and community fees shall be borne by the tenant, unless otherwise agreed.'} Any non-payment may lead to termination of the agreement under applicable law.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// ─── TEMPLATE: EMPLOYMENT ────────────────────────────────────────────────────
function buildEmploymentContract(data, lang) {
  const isEs = lang !== 'en';
  const ref = genRef();
  const disclaimer = isEs ? DISCLAIMER_ES : DISCLAIMER_EN;
  const parties = partyBlock(data, lang);
  const duration = durationBlock(data, lang);
  const optional = optionalClausesBlock(data, lang);
  const jurisdiction = jurisdictionBlock(data, lang);
  const signatures = signaturesBlock(data, lang);

  if (isEs) {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTRATO DE TRABAJO
Ref.: ${ref}
Fecha: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

ACUERDAN celebrar el presente CONTRATO DE TRABAJO con arreglo a las siguientes:

CLÁUSULAS

PRIMERA. Objeto y Categoría Profesional.

${data.party1Name} (empresa) contrata a ${data.party2Name} (trabajador) para desempeñar las siguientes funciones y responsabilidades: ${data.description}.${data.deliverables ? `\n\nResponsabilidades principales: ${data.deliverables}.` : ''}

La categoría o grupo profesional del trabajador es la que corresponda según el convenio colectivo aplicable y las funciones descritas.

SEGUNDA. Jornada Laboral.

La jornada de trabajo será la establecida en el convenio colectivo aplicable o la legalmente máxima permitida en la jurisdicción acordada, con distribución según las necesidades organizativas de la empresa, respetando en todo caso los descansos mínimos legales. ${data.exclusions ? `Condiciones especiales de jornada: ${data.exclusions}.` : ''}

TERCERA. Salario y Retribución.

El salario bruto acordado es de ${data.price}${data.currency ? ` (${data.currency})` : ''}, pagadero ${data.paymentType === 'monthly' ? 'mensualmente' : 'en los períodos acordados'}${data.paymentMethod ? ` mediante ${data.paymentMethod}` : ''}. El salario podrá ser revisado anualmente conforme al IPC o a los acuerdos del convenio colectivo aplicable. Se incluirán las pagas extraordinarias legalmente obligatorias.

CUARTA. Período de Prueba.

Se establece un período de prueba de tres (3) meses (o el máximo legal permitido para la categoría profesional según la ley aplicable). Durante este período, cualquiera de las partes podrá resolver el contrato sin indemnización y sin preaviso, salvo lo dispuesto legalmente.

${duration}

SEXTA. Vacaciones y Días Festivos.

El trabajador tendrá derecho a un mínimo de vacaciones anuales según lo establecido por la legislación laboral aplicable y el convenio colectivo sectorial. Las vacaciones se disfrutarán de acuerdo con la planificación de la empresa, garantizando siempre el mínimo legal.

SÉPTIMA. Obligaciones del Trabajador.

El trabajador se obliga a: (a) prestar sus servicios con la debida diligencia y profesionalidad; (b) cumplir las órdenes e instrucciones de la empresa; (c) guardar secreto sobre los asuntos de la empresa; (d) no incurrir en competencia desleal; (e) cumplir las normas de prevención de riesgos laborales; (f) comunicar cualquier situación que pudiera afectar a su capacidad de trabajo.

OCTAVA. Causas de Extinción.

El contrato podrá extinguirse por mutuo acuerdo, dimisión del trabajador con el preaviso legal, despido disciplinario por causas establecidas en la legislación laboral, despido objetivo por causas económicas, técnicas, organizativas o productivas, o cualquier otra causa contemplada en la normativa laboral aplicable. En todo caso, se estará a lo dispuesto en la legislación laboral vigente en materia de indemnizaciones.${data.breachPenalty ? `\n\nCondiciones adicionales de extinción pactadas: ${data.breachPenalty}.` : ''}
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  } else {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMPLOYMENT CONTRACT
Ref.: ${ref}
Date: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

AGREE to enter into this EMPLOYMENT CONTRACT in accordance with the following:

CLAUSES

FIRST. Position and Responsibilities.

${data.party1Name} (employer) hires ${data.party2Name} (employee) to perform the following functions and responsibilities: ${data.description}.${data.deliverables ? `\n\nKey responsibilities: ${data.deliverables}.` : ''}

The employee's professional category shall be that applicable under the collective bargaining agreement and described functions.

SECOND. Working Hours.

Working hours shall be those established in the applicable collective bargaining agreement or the legal maximum permitted in the agreed jurisdiction, distributed according to the company's organizational needs, always respecting minimum legal rest periods. ${data.exclusions ? `Special working conditions: ${data.exclusions}.` : ''}

THIRD. Salary and Compensation.

The agreed gross salary is ${data.price}${data.currency ? ` (${data.currency})` : ''}, payable ${data.paymentType === 'monthly' ? 'monthly' : 'on the agreed periods'}${data.paymentMethod ? ` via ${data.paymentMethod}` : ''}. Salary may be reviewed annually in line with inflation or applicable collective bargaining agreements. Legally required supplementary payments (bonuses) shall be included.

FOURTH. Probationary Period.

A probationary period of three (3) months is established (or the maximum legally permitted for the professional category under applicable law). During this period, either party may terminate the agreement without compensation or notice, subject to legal provisions.

${duration}

SIXTH. Holidays and Vacation.

The employee shall be entitled to a minimum of annual vacation days as established by applicable labor law and sector collective agreement. Vacation shall be scheduled in accordance with the company's planning, always guaranteeing the legal minimum.

SEVENTH. Employee Obligations.

The employee agrees to: (a) render services with due diligence and professionalism; (b) comply with company instructions; (c) maintain confidentiality over company matters; (d) not engage in unfair competition; (e) comply with health and safety regulations; (f) report any situation that may affect work capacity.

EIGHTH. Grounds for Termination.

The contract may be terminated by mutual agreement, employee resignation with legal notice, disciplinary dismissal under applicable labor law, objective dismissal on economic or organizational grounds, or any other cause set out in applicable labor regulations. Severance pay, if applicable, shall be governed by current labor legislation.${data.breachPenalty ? `\n\nAdditional agreed termination conditions: ${data.breachPenalty}.` : ''}
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// ─── TEMPLATE: PARTNERSHIP ───────────────────────────────────────────────────
function buildPartnershipContract(data, lang) {
  const isEs = lang !== 'en';
  const ref = genRef();
  const disclaimer = isEs ? DISCLAIMER_ES : DISCLAIMER_EN;
  const parties = partyBlock(data, lang);
  const economic = economicBlock(data, lang);
  const duration = durationBlock(data, lang);
  const optional = optionalClausesBlock(data, lang);
  const jurisdiction = jurisdictionBlock(data, lang);
  const signatures = signaturesBlock(data, lang);

  if (isEs) {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACUERDO DE ASOCIACIÓN / JOINT VENTURE
Ref.: ${ref}
Fecha: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

ACUERDAN celebrar el presente ACUERDO DE ASOCIACIÓN con arreglo a las siguientes:

CLÁUSULAS

PRIMERA. Objeto de la Asociación.

Las partes deciden unir sus recursos, conocimientos y esfuerzos para: ${data.description}.${data.deliverables ? `\n\nActividades y proyectos específicos de la asociación: ${data.deliverables}.` : ''}${data.exclusions ? `\n\nActividades excluidas del ámbito de esta asociación: ${data.exclusions}.` : ''}

SEGUNDA. Aportaciones de Cada Socio.

Cada parte se compromete a realizar las siguientes aportaciones a la asociación:
— ${data.party1Name}: se detallará entre las partes de forma específica, incluyendo capital, conocimiento, redes, recursos humanos u otros activos.
— ${data.party2Name}: se detallará entre las partes de forma específica, incluyendo capital, conocimiento, redes, recursos humanos u otros activos.
Las aportaciones deberán especificarse en un Anexo I que formará parte inseparable del presente contrato.

TERCERA. Distribución de Beneficios y Pérdidas.

${data.price ? `Las condiciones económicas acordadas son: ${data.price}${data.currency ? ` (${data.currency})` : ''}.` : 'Los beneficios y pérdidas se distribuirán en la proporción que las partes acuerden mediante Anexo firmado.'} La distribución podrá revisarse anualmente de mutuo acuerdo. Cada socio tendrá derecho a una información financiera periódica y transparente.

CUARTA. Toma de Decisiones y Gobierno.

Las decisiones ordinarias se adoptarán de mutuo acuerdo entre las partes. Para decisiones extraordinarias (nuevas inversiones, endeudamiento significativo, modificación del objeto social, admisión de nuevos socios, disolución de la asociación), se requerirá acuerdo unánime por escrito.

${duration}

SEXTA. Obligaciones Recíprocas.

Cada parte se obliga a: (a) dedicar los recursos y tiempo acordados; (b) actuar de buena fe en el interés común; (c) informar puntualmente a la otra parte de cualquier situación relevante; (d) no contraer obligaciones en nombre de la asociación sin autorización; (e) mantener confidencialidad sobre la información compartida.

SÉPTIMA. Salida de Socios y Transmisión de Participaciones.

Ninguna de las partes podrá transmitir su posición en la asociación a terceros sin el consentimiento previo y expreso de la otra parte. En caso de deseo de salida de uno de los socios, se establecerá un mecanismo de valoración y adquisición preferente por el otro socio antes de acudir a terceros.

OCTAVA. Disolución y Liquidación.

La asociación podrá disolverse por mutuo acuerdo, vencimiento del plazo, o incumplimiento grave de cualquiera de las partes. En caso de disolución, los activos y pasivos se liquidarán conforme a los porcentajes de participación acordados.${data.breachPenalty ? `\n\nPenalización por incumplimiento: ${data.breachPenalty}.` : ''}
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  } else {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTNERSHIP AGREEMENT / JOINT VENTURE
Ref.: ${ref}
Date: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

AGREE to enter into this PARTNERSHIP AGREEMENT in accordance with the following:

CLAUSES

FIRST. Purpose of the Partnership.

The parties agree to combine their resources, knowledge and efforts for: ${data.description}.${data.deliverables ? `\n\nSpecific activities and projects of the partnership: ${data.deliverables}.` : ''}${data.exclusions ? `\n\nActivities excluded from the scope of this partnership: ${data.exclusions}.` : ''}

SECOND. Contributions of Each Partner.

Each party commits to making the following contributions to the partnership:
— ${data.party1Name}: to be specifically detailed between the parties, including capital, knowledge, networks, human resources or other assets.
— ${data.party2Name}: to be specifically detailed between the parties, including capital, knowledge, networks, human resources or other assets.
Contributions must be specified in an Exhibit A that shall form an inseparable part of this agreement.

THIRD. Distribution of Profits and Losses.

${data.price ? `The agreed economic terms are: ${data.price}${data.currency ? ` (${data.currency})` : ''}.` : 'Profits and losses shall be distributed in the proportion the parties agree upon through a signed exhibit.'} Distribution may be reviewed annually by mutual agreement. Each partner shall have the right to periodic and transparent financial information.

FOURTH. Decision-Making and Governance.

Ordinary decisions shall be made by mutual agreement between the parties. For extraordinary decisions (new investments, significant borrowing, modification of business purpose, admission of new partners, dissolution of the partnership), unanimous written agreement shall be required.

${duration}

SIXTH. Reciprocal Obligations.

Each party agrees to: (a) dedicate the agreed resources and time; (b) act in good faith in the common interest; (c) promptly inform the other party of any relevant situation; (d) not incur obligations on behalf of the partnership without authorization; (e) maintain confidentiality over shared information.

SEVENTH. Exit of Partners and Transfer of Interests.

Neither party may transfer their position in the partnership to third parties without prior express consent of the other party. In the event a partner wishes to exit, a valuation and preferential purchase mechanism by the remaining partner shall be established before involving third parties.

EIGHTH. Dissolution and Liquidation.

The partnership may be dissolved by mutual agreement, expiration of the term, or material breach by either party. In case of dissolution, assets and liabilities shall be liquidated according to the agreed participation percentages.${data.breachPenalty ? `\n\nBreach penalty: ${data.breachPenalty}.` : ''}
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// ─── TEMPLATE: SALES ─────────────────────────────────────────────────────────
function buildSalesContract(data, lang) {
  const isEs = lang !== 'en';
  const ref = genRef();
  const disclaimer = isEs ? DISCLAIMER_ES : DISCLAIMER_EN;
  const parties = partyBlock(data, lang);
  const economic = economicBlock(data, lang);
  const optional = optionalClausesBlock(data, lang);
  const jurisdiction = jurisdictionBlock(data, lang);
  const signatures = signaturesBlock(data, lang);

  if (isEs) {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTRATO DE COMPRAVENTA
Ref.: ${ref}
Fecha: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

ACUERDAN celebrar el presente CONTRATO DE COMPRAVENTA con arreglo a las siguientes:

CLÁUSULAS

PRIMERA. Objeto de la Compraventa.

${data.party1Name} (el vendedor) vende a ${data.party2Name} (el comprador) el siguiente bien o activo: ${data.description}.${data.deliverables ? `\n\nDescripción detallada, características y estado del bien: ${data.deliverables}.` : ''}

SEGUNDA. Estado del Bien.

El bien se transmite en el estado en que se encuentra. El vendedor declara que el bien objeto de este contrato está libre de cargas, gravámenes, hipotecas, embargos u otros derechos reales que puedan afectar al comprador, salvo los expresamente indicados en el Anexo.${data.exclusions ? `\n\nCondiciones específicas sobre el estado: ${data.exclusions}.` : ''}

TERCERA. Transferencia de Propiedad (Traditio).

La transmisión de la propiedad del bien al comprador tendrá lugar en el momento de la entrega material del mismo, una vez se haya completado el pago íntegro del precio acordado. Hasta dicho momento, el bien permanece en propiedad del vendedor (cláusula de reserva de dominio).

${economic}

QUINTA. Entrega del Bien.

La entrega se realizará el día: ${data.startDate || 'a convenida entre las partes'}${data.party1Address ? `, en el domicilio del vendedor o lugar acordado` : ''}. Los costes de transporte y seguro durante el traslado serán a cargo de ${data.notes ? data.notes : 'la parte acordada (indicar en notas adicionales)'}.

SEXTA. Garantía.

El vendedor garantiza al comprador que el bien es conforme a la descripción realizada en este contrato. La garantía cubrirá los vicios ocultos del bien durante ${data.duration || 'el período legalmente establecido en la legislación aplicable'}. No quedan cubiertos por la garantía los desperfectos derivados de un uso incorrecto o modificaciones no autorizadas.

SÉPTIMA. Obligaciones del Vendedor.

El vendedor se obliga a: (a) entregar el bien en la fecha y condiciones acordadas; (b) transmitir la titularidad libre de cargas; (c) entregar toda la documentación relacionada con el bien; (d) responder por vicios ocultos durante el período de garantía.

OCTAVA. Obligaciones del Comprador.

El comprador se obliga a: (a) abonar el precio en los plazos acordados; (b) recibir el bien en la fecha y lugar pactados; (c) examinar el bien en el momento de la entrega y comunicar cualquier deficiencia visible de forma inmediata.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  } else {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SALES AGREEMENT
Ref.: ${ref}
Date: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

AGREE to enter into this SALES AGREEMENT in accordance with the following:

CLAUSES

FIRST. Subject of Sale.

${data.party1Name} (the seller) sells to ${data.party2Name} (the buyer) the following good or asset: ${data.description}.${data.deliverables ? `\n\nDetailed description, characteristics and condition of the good: ${data.deliverables}.` : ''}

SECOND. Condition of the Good.

The good is transferred in its current condition. The seller declares that the good subject to this agreement is free from liens, mortgages, encumbrances or other third-party rights that may affect the buyer, except those expressly indicated in an Exhibit.${data.exclusions ? `\n\nSpecific conditions regarding state: ${data.exclusions}.` : ''}

THIRD. Transfer of Title.

Title to the good shall transfer to the buyer upon physical delivery, once full payment of the agreed price has been completed. Until that moment, the good remains the property of the seller (retention of title clause).

${economic}

FIFTH. Delivery.

Delivery shall take place on: ${data.startDate || 'a date agreed between the parties'}. Transportation and insurance costs during transit shall be borne by ${data.notes ? data.notes : 'the party agreed upon (indicate in additional notes)'}.

SIXTH. Warranty.

The seller warrants to the buyer that the good conforms to the description made in this agreement. The warranty shall cover hidden defects for ${data.duration || 'the legally established period under applicable law'}. Damage resulting from improper use or unauthorized modifications is not covered by this warranty.

SEVENTH. Seller Obligations.

The seller agrees to: (a) deliver the good on the agreed date and in agreed condition; (b) transfer unencumbered title; (c) deliver all documentation related to the good; (d) warrant against hidden defects during the warranty period.

EIGHTH. Buyer Obligations.

The buyer agrees to: (a) pay the price on the agreed schedule; (b) receive the good on the agreed date and place; (c) inspect the good at the time of delivery and immediately report any visible deficiency.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// ─── TEMPLATE: CUSTOM ────────────────────────────────────────────────────────
function buildCustomContract(data, lang) {
  const isEs = lang !== 'en';
  const ref = genRef();
  const disclaimer = isEs ? DISCLAIMER_ES : DISCLAIMER_EN;
  const parties = partyBlock(data, lang);
  const economic = economicBlock(data, lang);
  const duration = durationBlock(data, lang);
  const optional = optionalClausesBlock(data, lang);
  const jurisdiction = jurisdictionBlock(data, lang);
  const signatures = signaturesBlock(data, lang);

  if (isEs) {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTRATO / ACUERDO PERSONALIZADO
Ref.: ${ref}
Fecha: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

ACUERDAN celebrar el presente CONTRATO con arreglo a las siguientes:

CLÁUSULAS

PRIMERA. Objeto del Contrato.

Las partes acuerdan el siguiente objeto: ${data.description}.${data.deliverables ? `\n\nAlcance específico y compromisos concretos: ${data.deliverables}.` : ''}${data.exclusions ? `\n\nExclusiones expresas: ${data.exclusions}.` : ''}

SEGUNDA. Compromisos Mutuos.

Ambas partes se obligan a cumplir de buena fe con las condiciones establecidas en el presente contrato, a comunicarse cualquier incidencia de forma diligente y a colaborar activamente para el cumplimiento exitoso del objeto del acuerdo. Ninguna de las partes podrá ceder o transferir sus obligaciones a terceros sin el consentimiento escrito de la otra.

${economic}

${duration}

QUINTA. Obligaciones Recíprocas y Condiciones Especiales.

${data.notes ? data.notes : 'Las condiciones especiales acordadas por las partes serán detalladas en los Anexos del presente contrato, que tendrán idéntico valor jurídico que el cuerpo principal del mismo.'}

SEXTA. Consecuencias del Incumplimiento.

El incumplimiento de los compromisos establecidos en este contrato dará derecho a la parte perjudicada a: exigir el cumplimiento forzoso, resolver el contrato con derecho a indemnización de daños y perjuicios, y/o aplicar las penalizaciones pactadas en la Cláusula Económica.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  } else {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOM AGREEMENT / CONTRACT
Ref.: ${ref}
Date: ${formatDate(lang)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimer}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parties}

AGREE to enter into this CUSTOM AGREEMENT in accordance with the following:

CLAUSES

FIRST. Subject of the Agreement.

The parties agree to the following subject: ${data.description}.${data.deliverables ? `\n\nSpecific scope and concrete commitments: ${data.deliverables}.` : ''}${data.exclusions ? `\n\nExpress exclusions: ${data.exclusions}.` : ''}

SECOND. Mutual Commitments.

Both parties agree to comply in good faith with the conditions established in this agreement, to communicate any incident diligently and to actively collaborate for the successful fulfillment of the agreement's purpose. Neither party may assign or transfer their obligations to third parties without written consent of the other.

${economic}

${duration}

FIFTH. Reciprocal Obligations and Special Conditions.

${data.notes ? data.notes : 'Special conditions agreed by the parties will be detailed in the Exhibits to this agreement, which shall have the same legal value as the main body.'}

SIXTH. Consequences of Breach.

Breach of the commitments established in this agreement shall entitle the injured party to: demand specific performance, terminate the agreement with right to compensation for damages, and/or apply the penalties agreed in the Economic Clause.
${optional}

${jurisdiction}

${signatures}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${disclaimer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
}

// ─── MAIN BUILD FUNCTION ─────────────────────────────────────────────────────
export function buildContract(data, lang = 'es') {
  switch (data.contractType) {
    case 'services':    return buildServicesContract(data, lang);
    case 'nda':         return buildNdaContract(data, lang);
    case 'freelance':   return buildFreelanceContract(data, lang);
    case 'rental':      return buildRentalContract(data, lang);
    case 'employment':  return buildEmploymentContract(data, lang);
    case 'partnership': return buildPartnershipContract(data, lang);
    case 'sales':       return buildSalesContract(data, lang);
    case 'custom':      return buildCustomContract(data, lang);
    default:            return buildCustomContract(data, lang);
  }
}

// ─── VARIANT MODIFIER ────────────────────────────────────────────────────────
export function applyVariant(contract, variant, lang) {
  const isEs = lang !== 'en';
  const headers = {
    protective: isEs
      ? '\n[VARIANTE: MÁS PROTECTORA — Cláusulas reforzadas a favor de LA PRIMERA PARTE]\n'
      : '\n[VARIANT: MORE PROTECTIVE — Reinforced clauses in favor of THE FIRST PARTY]\n',
    balanced: isEs
      ? '\n[VARIANTE: MÁS EQUILIBRADA — Derechos y obligaciones balanceados entre ambas partes]\n'
      : '\n[VARIANT: MORE BALANCED — Rights and obligations balanced between both parties]\n',
    simple: isEs
      ? '\n[VARIANTE: SIMPLIFICADA — Lenguaje claro y directo, mínimo tecnicismo legal]\n'
      : '\n[VARIANT: SIMPLIFIED — Clear and direct language, minimal legal jargon]\n',
    penal: isEs
      ? '\n[VARIANTE: CLÁUSULA PENAL REFORZADA — Penalizaciones por incumplimiento añadidas]\n'
      : '\n[VARIANT: REINFORCED PENALTY CLAUSE — Breach penalties added]\n',
  };

  const additions = {
    protective: isEs
      ? `\n\nNOTA DE VARIANTE PROTECTORA: Esta versión incluye cláusulas reforzadas para proteger los intereses de LA PRIMERA PARTE, incluyendo: (a) indemnización por daños y perjuicios equivalente al 150% del valor del contrato en caso de incumplimiento material por la otra parte; (b) derecho de retención de todos los entregables hasta el cobro completo; (c) cláusula de auditoría con derecho de LA PRIMERA PARTE a revisar la ejecución del contrato en cualquier momento con 48h de preaviso; (d) responsabilidad solidaria de los administradores o representantes de la otra parte en caso de ser una empresa sin suficiente solvencia acreditada.\n`
      : `\n\nPROTECTIVE VARIANT NOTE: This version includes reinforced clauses to protect THE FIRST PARTY's interests, including: (a) indemnification equivalent to 150% of the contract value for material breach by the other party; (b) right to retain all deliverables until full payment; (c) audit right for THE FIRST PARTY to review contract execution at any time with 48h notice; (d) joint liability of directors or representatives of the other party if it is a company without demonstrated solvency.\n`,
    balanced: isEs
      ? `\n\nNOTA DE VARIANTE EQUILIBRADA: Esta versión busca un equilibrio justo entre las partes, distribuyendo equitativamente riesgos, derechos y obligaciones. Las penalizaciones son proporcionales a los daños reales. Los plazos de resolución de conflictos son razonables para ambas partes. Se prioriza la negociación amistosa como primera vía de resolución.\n`
      : `\n\nBALANCED VARIANT NOTE: This version seeks a fair balance between parties, equitably distributing risks, rights and obligations. Penalties are proportional to actual damages. Dispute resolution timelines are reasonable for both parties. Friendly negotiation is prioritized as the first resolution route.\n`,
    simple: isEs
      ? `\n\nNOTA DE VARIANTE SIMPLIFICADA: Este contrato usa lenguaje claro y directo. En resumen: las partes acuerdan lo descrito, en el precio pactado, con los plazos indicados. Si algo va mal, primero hablan. Si no se resuelve, acuden a mediación. Siempre aplica la ley indicada. Para situaciones complejas, consulta a un abogado.\n`
      : `\n\nSIMPLIFIED VARIANT NOTE: This contract uses clear and direct language. In summary: the parties agree to what is described, at the agreed price, within the stated timeframes. If something goes wrong, they first talk. If unresolved, they go to mediation. The stated law always applies. For complex situations, consult a lawyer.\n`,
    penal: isEs
      ? `\n\nCLÁUSULA PENAL ADICIONAL: En caso de incumplimiento material de cualquiera de las obligaciones esenciales establecidas en este contrato, la parte incumplidora deberá abonar a la parte cumplidora una penalización equivalente al veinte por ciento (20%) del valor total del contrato, con independencia de los daños reales causados. Esta penalización tiene carácter de cláusula penal sustitutiva, sin perjuicio del derecho de la parte cumplidora a exigir adicionalmente la indemnización de los daños que excedan dicho importe, acreditando su cuantía. El pago de la penalización no exime del cumplimiento de la obligación principal.\n`
      : `\n\nADDITIONAL PENALTY CLAUSE: In the event of material breach of any essential obligations established in this agreement, the breaching party shall pay the complying party a penalty equal to twenty percent (20%) of the total contract value, regardless of actual damages caused. This penalty acts as a substitutive penalty clause, without prejudice to the complying party's right to additionally claim damages exceeding such amount, proving their quantum. Payment of the penalty does not exempt from fulfillment of the main obligation.\n`,
  };

  const header = headers[variant] || '';
  const addition = additions[variant] || '';
  const lines = contract.split('\n');
  const insertIdx = 3;
  lines.splice(insertIdx, 0, header);
  return lines.join('\n') + addition;
}

// ─── GROQ SYSTEM PROMPT ──────────────────────────────────────────────────────
export function buildSystemPrompt(contractType, lang) {
  const isEs = lang !== 'en';
  const typeNames = {
    services:    isEs ? 'Prestación de Servicios' : 'Service Agreement',
    nda:         isEs ? 'Confidencialidad (NDA)' : 'Non-Disclosure Agreement (NDA)',
    freelance:   isEs ? 'Trabajo Freelance / Autónomo' : 'Freelance Contract',
    rental:      isEs ? 'Arrendamiento' : 'Rental Agreement',
    employment:  isEs ? 'Contrato Laboral' : 'Employment Contract',
    partnership: isEs ? 'Acuerdo de Asociación / Joint Venture' : 'Partnership Agreement / Joint Venture',
    sales:       isEs ? 'Compraventa' : 'Sales Agreement',
    custom:      isEs ? 'Contrato Personalizado' : 'Custom Agreement',
  };
  const typeName = typeNames[contractType] || (isEs ? 'Contrato' : 'Contract');

  if (isEs) {
    return `Eres un abogado experto en redacción de contratos mercantiles y civiles, con conocimiento profundo de los sistemas legales de España, México, Colombia, Argentina, Chile y otros países hispanohablantes, así como del common law anglosajón.

Tu tarea es redactar un CONTRATO DE ${typeName.toUpperCase()} profesional, completo y personalizado basado en los datos aportados por el usuario.

REQUISITOS OBLIGATORIOS:
1. El contrato debe ser COMPLETAMENTE FUNCIONAL y listo para usar como base de trabajo.
2. Incluir al INICIO Y AL FINAL el siguiente aviso legal EXACTAMENTE:
   "⚠️ AVISO LEGAL: Este documento es una plantilla orientativa generada automáticamente. NO constituye asesoramiento legal profesional. Para contratos vinculantes, consulta siempre con un abogado colegiado en tu jurisdicción. El uso de este documento es bajo tu propia responsabilidad."
3. Estructura obligatoria:
   - Encabezado con título, número de referencia y fecha
   - Comparecientes (datos de ambas partes)
   - Exponen / Antecedentes
   - Cláusulas numeradas (mínimo 8 cláusulas sustanciales)
   - Terminación
   - Ley aplicable y jurisdicción
   - Disposiciones finales
   - Bloque de firmas con espacios para fecha y firma de cada parte
4. El lenguaje debe ser jurídicamente preciso pero comprensible.
5. Las cláusulas deben adaptarse ESPECÍFICamente a los datos del usuario, no ser genéricas.
6. Si el usuario ha seleccionado cláusulas opcionales (confidencialidad, no competencia, propiedad intelectual, etc.), inclúyelas de forma desarrollada.
7. El contrato debe cubrir los aspectos prácticos MÁS IMPORTANTES del tipo de contrato específico.
8. Usa el tono indicado por el usuario (formal / estándar / simplificado).
9. Genera referencias a la jurisdicción y ley aplicable indicada por el usuario.
10. El documento debe tener entre 500 y 900 palabras de contenido real (sin contar el aviso legal).

Responde ÚNICAMENTE con el contrato en texto plano. Sin explicaciones, sin comentarios, sin markdown. Solo el texto del contrato.`;
  } else {
    return `You are an expert lawyer in drafting commercial and civil contracts, with deep knowledge of common law systems (US, UK, Canada, Australia), as well as Spanish and Latin American legal systems.

Your task is to draft a professional, complete and customized ${typeName.toUpperCase()} based on the information provided by the user.

MANDATORY REQUIREMENTS:
1. The contract must be COMPLETELY FUNCTIONAL and ready to use as a working base.
2. Include at the BEGINNING AND END the following legal notice EXACTLY:
   "⚠️ LEGAL NOTICE: This document is an automatically generated guidance template. It does NOT constitute professional legal advice. For binding contracts, always consult with a licensed attorney in your jurisdiction. Use of this document is at your own risk."
3. Mandatory structure:
   - Header with title, reference number and date
   - Parties (data of both parties)
   - Recitals / Background
   - Numbered clauses (minimum 8 substantial clauses)
   - Termination
   - Applicable law and jurisdiction
   - Final provisions
   - Signature block with spaces for date and signature of each party
4. Language must be legally precise yet understandable.
5. Clauses must be SPECIFICALLY adapted to the user's data, not generic.
6. If the user has selected optional clauses (confidentiality, non-compete, IP rights, etc.), include them fully developed.
7. The contract must cover the MOST IMPORTANT practical aspects of the specific contract type.
8. Use the tone indicated by the user (formal / standard / simplified).
9. Generate references to the jurisdiction and applicable law indicated by the user.
10. The document should contain between 500 and 900 words of actual content (excluding the legal notice).

Respond ONLY with the contract in plain text. No explanations, no comments, no markdown. Just the contract text.`;
  }
}
