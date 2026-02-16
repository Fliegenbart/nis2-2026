export type Severity = "kritisch" | "hoch" | "mittel";
export type AnswerValue = "fulfilled" | "partial" | "not_fulfilled" | "not_applicable";

export interface NIS2Question {
  id: string;
  text: { de: string; en: string };
  helpText: { de: string; en: string };
  severity: Severity;
  legalReference: string;
}

export interface NIS2Category {
  id: string;
  name: { de: string; en: string };
  description: { de: string; en: string };
  articleRef: string;
  icon: string;
  isFree: boolean;
  questions: NIS2Question[];
}

export const NIS2_CATEGORIES: NIS2Category[] = [
  {
    id: "risk-management",
    name: { de: "Risikomanagement", en: "Risk Management" },
    description: {
      de: "Konzepte für Risikoanalyse und Sicherheit von Informationssystemen",
      en: "Risk analysis concepts and information system security",
    },
    articleRef: "Art. 21(2)(a)",
    icon: "ShieldAlert",
    isFree: true,
    questions: [
      {
        id: "rm-001",
        text: {
          de: "Existiert ein dokumentiertes Informationssicherheits-Managementsystem (ISMS)?",
          en: "Is there a documented Information Security Management System (ISMS)?",
        },
        helpText: {
          de: "Ein ISMS nach ISO 27001 oder vergleichbar ist die Grundlage für systematisches Sicherheitsmanagement. Es umfasst Richtlinien, Prozesse und Maßnahmen.",
          en: "An ISMS according to ISO 27001 or equivalent is the foundation for systematic security management. It includes policies, processes, and measures.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(a) EU 2022/2555",
      },
      {
        id: "rm-002",
        text: {
          de: "Werden regelmäßige Risikoanalysen durchgeführt und dokumentiert?",
          en: "Are regular risk analyses conducted and documented?",
        },
        helpText: {
          de: "Risikoanalysen identifizieren Bedrohungen und Schwachstellen. Sie müssen systematisch und wiederkehrend durchgeführt werden.",
          en: "Risk analyses identify threats and vulnerabilities. They must be conducted systematically and on a recurring basis.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(a) EU 2022/2555",
      },
      {
        id: "rm-003",
        text: {
          de: "Ist ein Risiko-Behandlungsplan erstellt und wird dieser umgesetzt?",
          en: "Has a risk treatment plan been created and is it being implemented?",
        },
        helpText: {
          de: "Ein Risiko-Behandlungsplan definiert konkrete Maßnahmen für identifizierte Risiken: Vermeiden, Vermindern, Übertragen oder Akzeptieren.",
          en: "A risk treatment plan defines specific measures for identified risks: avoid, mitigate, transfer, or accept.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(a) EU 2022/2555",
      },
      {
        id: "rm-004",
        text: {
          de: "Sind Rollen und Verantwortlichkeiten für die Informationssicherheit klar definiert?",
          en: "Are roles and responsibilities for information security clearly defined?",
        },
        helpText: {
          de: "Klare Zuständigkeiten sind essentiell: CISO, IT-Sicherheitsbeauftragte, Datenschutzbeauftragte und deren Berichtslinien zur Geschäftsführung.",
          en: "Clear responsibilities are essential: CISO, IT security officers, data protection officers, and their reporting lines to management.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(a) EU 2022/2555",
      },
      {
        id: "rm-005",
        text: {
          de: "Wird die Risikobewertung mindestens jährlich aktualisiert?",
          en: "Is the risk assessment updated at least annually?",
        },
        helpText: {
          de: "Die Bedrohungslandschaft ändert sich ständig. Eine jährliche Aktualisierung ist das Minimum, bei wesentlichen Änderungen auch häufiger.",
          en: "The threat landscape is constantly changing. Annual updates are the minimum; more frequent updates are needed when significant changes occur.",
        },
        severity: "mittel",
        legalReference: "Art. 21(2)(a) EU 2022/2555",
      },
    ],
  },
  {
    id: "incident-handling",
    name: { de: "Incident Handling", en: "Incident Handling" },
    description: {
      de: "Bewältigung von Sicherheitsvorfällen",
      en: "Security incident management",
    },
    articleRef: "Art. 21(2)(b)",
    icon: "Siren",
    isFree: true,
    questions: [
      {
        id: "ih-001",
        text: {
          de: "Gibt es einen dokumentierten Incident-Response-Plan?",
          en: "Is there a documented incident response plan?",
        },
        helpText: {
          de: "Der Plan muss Erkennung, Analyse, Eindämmung, Beseitigung und Wiederherstellung abdecken. Er sollte regelmäßig getestet werden.",
          en: "The plan must cover detection, analysis, containment, eradication, and recovery. It should be regularly tested.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(b) EU 2022/2555",
      },
      {
        id: "ih-002",
        text: {
          de: "Können Sicherheitsvorfälle innerhalb von 24 Stunden an die zuständige Behörde gemeldet werden?",
          en: "Can security incidents be reported to the competent authority within 24 hours?",
        },
        helpText: {
          de: "NIS2 verlangt eine Frühwarnung innerhalb von 24 Stunden und einen vollständigen Bericht innerhalb von 72 Stunden nach Kenntnis eines erheblichen Vorfalls.",
          en: "NIS2 requires an early warning within 24 hours and a full report within 72 hours of becoming aware of a significant incident.",
        },
        severity: "kritisch",
        legalReference: "Art. 23 EU 2022/2555",
      },
      {
        id: "ih-003",
        text: {
          de: "Wird der Incident-Response-Plan regelmäßig getestet (z.B. Tabletop-Übungen)?",
          en: "Is the incident response plan regularly tested (e.g., tabletop exercises)?",
        },
        helpText: {
          de: "Regelmäßige Tests stellen sicher, dass alle Beteiligten ihre Rolle kennen und der Plan in der Praxis funktioniert.",
          en: "Regular tests ensure all stakeholders know their roles and the plan works in practice.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(b) EU 2022/2555",
      },
      {
        id: "ih-004",
        text: {
          de: "Werden alle Sicherheitsvorfälle dokumentiert und analysiert?",
          en: "Are all security incidents documented and analyzed?",
        },
        helpText: {
          de: "Lückenlose Dokumentation ermöglicht Lessons Learned und ist für Nachweise gegenüber Behörden unerlässlich.",
          en: "Complete documentation enables lessons learned and is essential for evidence to authorities.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(b) EU 2022/2555",
      },
      {
        id: "ih-005",
        text: {
          de: "Gibt es definierte Eskalationswege und Kommunikationsketten?",
          en: "Are there defined escalation paths and communication chains?",
        },
        helpText: {
          de: "Klare Eskalationswege stellen sicher, dass die richtigen Personen rechtzeitig informiert werden – intern und extern.",
          en: "Clear escalation paths ensure the right people are informed in time – internally and externally.",
        },
        severity: "mittel",
        legalReference: "Art. 21(2)(b) EU 2022/2555",
      },
    ],
  },
  {
    id: "business-continuity",
    name: { de: "Business Continuity", en: "Business Continuity" },
    description: {
      de: "Aufrechterhaltung des Betriebs, Backup-Management und Krisenmanagement",
      en: "Business operations continuity, backup management, and crisis management",
    },
    articleRef: "Art. 21(2)(c)",
    icon: "Database",
    isFree: false,
    questions: [
      {
        id: "bc-001",
        text: {
          de: "Existiert ein Business-Continuity-Plan (BCP)?",
          en: "Does a Business Continuity Plan (BCP) exist?",
        },
        helpText: {
          de: "Ein BCP beschreibt, wie der Geschäftsbetrieb bei einem schwerwiegenden Vorfall aufrechterhalten oder schnell wiederhergestellt wird.",
          en: "A BCP describes how business operations are maintained or quickly restored during a serious incident.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(c) EU 2022/2555",
      },
      {
        id: "bc-002",
        text: {
          de: "Werden regelmäßige Backups erstellt und an einem sicheren Ort aufbewahrt?",
          en: "Are regular backups created and stored in a secure location?",
        },
        helpText: {
          de: "Die 3-2-1-Regel gilt als Best Practice: 3 Kopien, 2 verschiedene Medien, 1 offsite. Backups müssen verschlüsselt sein.",
          en: "The 3-2-1 rule is best practice: 3 copies, 2 different media, 1 offsite. Backups must be encrypted.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(c) EU 2022/2555",
      },
      {
        id: "bc-003",
        text: {
          de: "Werden Backup-Wiederherstellungen mindestens halbjährlich getestet?",
          en: "Are backup restorations tested at least semi-annually?",
        },
        helpText: {
          de: "Ein Backup ist nur so gut wie seine Wiederherstellbarkeit. Regelmäßige Restore-Tests sind unverzichtbar.",
          en: "A backup is only as good as its restorability. Regular restore tests are indispensable.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(c) EU 2022/2555",
      },
      {
        id: "bc-004",
        text: {
          de: "Gibt es einen Disaster-Recovery-Plan mit definierten RPO/RTO-Werten?",
          en: "Is there a disaster recovery plan with defined RPO/RTO values?",
        },
        helpText: {
          de: "RPO (Recovery Point Objective) und RTO (Recovery Time Objective) definieren den maximal tolerierbaren Datenverlust und die maximale Ausfallzeit.",
          en: "RPO (Recovery Point Objective) and RTO (Recovery Time Objective) define the maximum tolerable data loss and maximum downtime.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(c) EU 2022/2555",
      },
      {
        id: "bc-005",
        text: {
          de: "Ist ein Krisenmanagement-Team benannt und geschult?",
          en: "Is a crisis management team designated and trained?",
        },
        helpText: {
          de: "Ein dediziertes Krisenteam mit klaren Rollen und regelmäßigen Übungen ist entscheidend für eine effektive Krisenbewältigung.",
          en: "A dedicated crisis team with clear roles and regular exercises is crucial for effective crisis management.",
        },
        severity: "mittel",
        legalReference: "Art. 21(2)(c) EU 2022/2555",
      },
    ],
  },
  {
    id: "supply-chain",
    name: { de: "Lieferkettensicherheit", en: "Supply Chain Security" },
    description: {
      de: "Sicherheit der Lieferkette einschließlich Beziehungen zu Dienstleistern",
      en: "Supply chain security including relationships with service providers",
    },
    articleRef: "Art. 21(2)(d)",
    icon: "Link",
    isFree: false,
    questions: [
      {
        id: "sc-001",
        text: {
          de: "Werden Lieferanten und Dienstleister einer Sicherheitsbewertung unterzogen?",
          en: "Are suppliers and service providers subjected to security assessments?",
        },
        helpText: {
          de: "NIS2 verlangt ausdrücklich die Berücksichtigung der Sicherheitspraktiken von Lieferanten. Dies umfasst Cloud-Provider, IT-Dienstleister und andere kritische Zulieferer.",
          en: "NIS2 explicitly requires consideration of supplier security practices. This includes cloud providers, IT service providers, and other critical suppliers.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(d) EU 2022/2555",
      },
      {
        id: "sc-002",
        text: {
          de: "Enthalten Verträge mit Lieferanten verbindliche Sicherheitsanforderungen?",
          en: "Do contracts with suppliers contain mandatory security requirements?",
        },
        helpText: {
          de: "Vertragliche Absicherung ist essentiell: SLAs, Sicherheitsstandards, Audit-Rechte und Meldepflichten bei Vorfällen.",
          en: "Contractual safeguards are essential: SLAs, security standards, audit rights, and incident reporting obligations.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(d) EU 2022/2555",
      },
      {
        id: "sc-003",
        text: {
          de: "Wird die Sicherheitslage der Lieferkette regelmäßig überprüft?",
          en: "Is the security posture of the supply chain regularly reviewed?",
        },
        helpText: {
          de: "Einmalige Bewertung reicht nicht. Regelmäßige Re-Assessments und kontinuierliches Monitoring sind nötig.",
          en: "One-time assessment is not enough. Regular re-assessments and continuous monitoring are necessary.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(d) EU 2022/2555",
      },
      {
        id: "sc-004",
        text: {
          de: "Gibt es einen Notfallplan für den Ausfall kritischer Lieferanten?",
          en: "Is there a contingency plan for the failure of critical suppliers?",
        },
        helpText: {
          de: "Ein Notfallplan umfasst alternative Lieferanten, Überbrückungsmaßnahmen und Exit-Strategien für kritische Dienstleister.",
          en: "A contingency plan includes alternative suppliers, bridging measures, and exit strategies for critical service providers.",
        },
        severity: "mittel",
        legalReference: "Art. 21(2)(d) EU 2022/2555",
      },
    ],
  },
  {
    id: "network-security",
    name: { de: "Netzsicherheit", en: "Network Security" },
    description: {
      de: "Sicherheit bei Erwerb, Entwicklung und Wartung von Netz- und Informationssystemen",
      en: "Security in acquisition, development, and maintenance of network and information systems",
    },
    articleRef: "Art. 21(2)(e)",
    icon: "Network",
    isFree: false,
    questions: [
      {
        id: "ns-001",
        text: {
          de: "Werden neue Systeme vor Inbetriebnahme einer Sicherheitsprüfung unterzogen?",
          en: "Are new systems subjected to security testing before deployment?",
        },
        helpText: {
          de: "Security-by-Design: Neue Systeme müssen vor dem Go-Live auf Schwachstellen geprüft werden. Dies umfasst Code-Reviews, Penetrationstests und Konfigurationschecks.",
          en: "Security by design: New systems must be checked for vulnerabilities before going live. This includes code reviews, penetration tests, and configuration checks.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(e) EU 2022/2555",
      },
      {
        id: "ns-002",
        text: {
          de: "Gibt es einen dokumentierten Patch-Management-Prozess?",
          en: "Is there a documented patch management process?",
        },
        helpText: {
          de: "Ein systematischer Patch-Management-Prozess stellt sicher, dass Sicherheitsupdates zeitnah eingespielt werden. Kritische Patches sollten innerhalb von 24-72 Stunden implementiert werden.",
          en: "A systematic patch management process ensures security updates are applied promptly. Critical patches should be implemented within 24-72 hours.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(e) EU 2022/2555",
      },
      {
        id: "ns-003",
        text: {
          de: "Sind Netzwerke segmentiert und wird der Datenverkehr überwacht?",
          en: "Are networks segmented and is traffic monitored?",
        },
        helpText: {
          de: "Netzwerksegmentierung begrenzt die Ausbreitung von Angriffen. Monitoring ermöglicht die frühzeitige Erkennung verdächtiger Aktivitäten.",
          en: "Network segmentation limits the spread of attacks. Monitoring enables early detection of suspicious activities.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(e) EU 2022/2555",
      },
      {
        id: "ns-004",
        text: {
          de: "Werden regelmäßige Penetrationstests durchgeführt?",
          en: "Are regular penetration tests conducted?",
        },
        helpText: {
          de: "Penetrationstests simulieren reale Angriffe und identifizieren Schwachstellen, bevor Angreifer sie ausnutzen können.",
          en: "Penetration tests simulate real attacks and identify vulnerabilities before attackers can exploit them.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(e) EU 2022/2555",
      },
      {
        id: "ns-005",
        text: {
          de: "Wird ein Vulnerability-Disclosure-Verfahren angeboten?",
          en: "Is a vulnerability disclosure procedure offered?",
        },
        helpText: {
          de: "Ein Vulnerability-Disclosure-Verfahren ermöglicht externen Sicherheitsforschern, Schwachstellen verantwortungsvoll zu melden.",
          en: "A vulnerability disclosure procedure allows external security researchers to responsibly report vulnerabilities.",
        },
        severity: "mittel",
        legalReference: "Art. 21(2)(e) EU 2022/2555",
      },
    ],
  },
  {
    id: "assessment",
    name: { de: "Bewertung & Testing", en: "Assessment & Testing" },
    description: {
      de: "Konzepte und Verfahren zur Bewertung der Wirksamkeit von Risikomanagementmaßnahmen",
      en: "Concepts and procedures for assessing the effectiveness of risk management measures",
    },
    articleRef: "Art. 21(2)(f)",
    icon: "ClipboardCheck",
    isFree: false,
    questions: [
      {
        id: "as-001",
        text: {
          de: "Werden interne Audits der Cybersicherheitsmaßnahmen durchgeführt?",
          en: "Are internal audits of cybersecurity measures conducted?",
        },
        helpText: {
          de: "Interne Audits prüfen die Wirksamkeit und Angemessenheit der implementierten Sicherheitsmaßnahmen.",
          en: "Internal audits verify the effectiveness and appropriateness of implemented security measures.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(f) EU 2022/2555",
      },
      {
        id: "as-002",
        text: {
          de: "Gibt es KPIs/Metriken zur Messung der Sicherheitseffektivität?",
          en: "Are there KPIs/metrics for measuring security effectiveness?",
        },
        helpText: {
          de: "Messbare KPIs wie Mean Time to Detect (MTTD), Mean Time to Respond (MTTR) oder Patch-Abdeckungsraten ermöglichen objektive Bewertungen.",
          en: "Measurable KPIs like Mean Time to Detect (MTTD), Mean Time to Respond (MTTR), or patch coverage rates enable objective assessments.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(f) EU 2022/2555",
      },
      {
        id: "as-003",
        text: {
          de: "Werden Audit-Ergebnisse dokumentiert und Maßnahmen nachverfolgt?",
          en: "Are audit findings documented and remediation tracked?",
        },
        helpText: {
          de: "Dokumentation und Tracking stellen sicher, dass identifizierte Schwachstellen auch tatsächlich behoben werden.",
          en: "Documentation and tracking ensure that identified weaknesses are actually remediated.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(f) EU 2022/2555",
      },
      {
        id: "as-004",
        text: {
          de: "Findet ein Management-Review der Sicherheitslage statt?",
          en: "Does a management review of the security posture take place?",
        },
        helpText: {
          de: "Die Geschäftsführung muss die Sicherheitslage regelmäßig bewerten. NIS2 macht dies zur Pflicht der Leitungsorgane.",
          en: "Management must regularly assess the security posture. NIS2 makes this an obligation of governing bodies.",
        },
        severity: "mittel",
        legalReference: "Art. 21(2)(f) EU 2022/2555",
      },
    ],
  },
  {
    id: "cryptography",
    name: { de: "Kryptografie", en: "Cryptography" },
    description: {
      de: "Konzepte und Verfahren für den Einsatz von Kryptografie und Verschlüsselung",
      en: "Concepts and procedures for the use of cryptography and encryption",
    },
    articleRef: "Art. 21(2)(g)",
    icon: "Lock",
    isFree: false,
    questions: [
      {
        id: "cr-001",
        text: {
          de: "Werden aktuelle kryptografische Standards (z.B. AES-256, TLS 1.3) eingesetzt?",
          en: "Are current cryptographic standards (e.g., AES-256, TLS 1.3) used?",
        },
        helpText: {
          de: "Veraltete Algorithmen wie DES, MD5 oder TLS 1.0/1.1 sind unsicher. Nur aktuelle Standards bieten ausreichenden Schutz.",
          en: "Outdated algorithms like DES, MD5, or TLS 1.0/1.1 are insecure. Only current standards provide adequate protection.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(g) EU 2022/2555",
      },
      {
        id: "cr-002",
        text: {
          de: "Gibt es eine Richtlinie für den Einsatz von Verschlüsselung?",
          en: "Is there a policy for the use of encryption?",
        },
        helpText: {
          de: "Eine Verschlüsselungsrichtlinie definiert, welche Daten verschlüsselt werden müssen (at rest, in transit) und welche Algorithmen zugelassen sind.",
          en: "An encryption policy defines which data must be encrypted (at rest, in transit) and which algorithms are approved.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(g) EU 2022/2555",
      },
      {
        id: "cr-003",
        text: {
          de: "Werden kryptografische Schlüssel sicher verwaltet (Key Management)?",
          en: "Are cryptographic keys securely managed (key management)?",
        },
        helpText: {
          de: "Key Management umfasst sichere Erzeugung, Speicherung, Rotation und Vernichtung von Schlüsseln. HSMs werden empfohlen.",
          en: "Key management includes secure generation, storage, rotation, and destruction of keys. HSMs are recommended.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(g) EU 2022/2555",
      },
      {
        id: "cr-004",
        text: {
          de: "Werden Verschlüsselungstechnologien regelmäßig überprüft und aktualisiert?",
          en: "Are encryption technologies regularly reviewed and updated?",
        },
        helpText: {
          de: "Kryptografische Verfahren können durch neue Angriffe oder Quantencomputer unsicher werden. Regelmäßige Reviews sind notwendig.",
          en: "Cryptographic methods can become insecure due to new attacks or quantum computers. Regular reviews are necessary.",
        },
        severity: "mittel",
        legalReference: "Art. 21(2)(g) EU 2022/2555",
      },
    ],
  },
  {
    id: "hr-training",
    name: { de: "Personal & Schulung", en: "HR & Training" },
    description: {
      de: "Sicherheit des Personals, Zugriffskontrolle und Cyberhygiene-Schulungen",
      en: "Personnel security, access control, and cyber hygiene training",
    },
    articleRef: "Art. 21(2)(h)",
    icon: "GraduationCap",
    isFree: false,
    questions: [
      {
        id: "ht-001",
        text: {
          de: "Werden regelmäßige Security-Awareness-Schulungen für alle Mitarbeiter durchgeführt?",
          en: "Are regular security awareness trainings conducted for all employees?",
        },
        helpText: {
          de: "NIS2 verlangt Cyberhygiene-Praktiken und Schulungen. Alle Mitarbeiter müssen mindestens jährlich geschult werden.",
          en: "NIS2 requires cyber hygiene practices and training. All employees must be trained at least annually.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(h) EU 2022/2555",
      },
      {
        id: "ht-002",
        text: {
          de: "Erhält die Geschäftsführung spezifische Cybersicherheits-Schulungen?",
          en: "Does management receive specific cybersecurity training?",
        },
        helpText: {
          de: "Art. 20(2) NIS2 verpflichtet Leitungsorgane ausdrücklich zu Cybersicherheits-Schulungen. Die Geschäftsführung haftet persönlich.",
          en: "Art. 20(2) NIS2 explicitly requires governing bodies to undergo cybersecurity training. Management is personally liable.",
        },
        severity: "kritisch",
        legalReference: "Art. 20(2) EU 2022/2555",
      },
      {
        id: "ht-003",
        text: {
          de: "Werden Phishing-Simulationen durchgeführt?",
          en: "Are phishing simulations conducted?",
        },
        helpText: {
          de: "Phishing-Simulationen testen die Wachsamkeit der Mitarbeiter und identifizieren Schulungsbedarf im Umgang mit Social Engineering.",
          en: "Phishing simulations test employee vigilance and identify training needs in handling social engineering.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(h) EU 2022/2555",
      },
      {
        id: "ht-004",
        text: {
          de: "Gibt es dokumentierte Grundsätze der Cyberhygiene?",
          en: "Are there documented basic cyber hygiene practices?",
        },
        helpText: {
          de: "Cyberhygiene umfasst Passwortregeln, Clean-Desk-Policy, sichere Gerätenutzung und Verhalten bei verdächtigen E-Mails.",
          en: "Cyber hygiene includes password rules, clean desk policy, secure device usage, and behavior for suspicious emails.",
        },
        severity: "mittel",
        legalReference: "Art. 21(2)(h) EU 2022/2555",
      },
    ],
  },
  {
    id: "authentication",
    name: { de: "Authentifizierung", en: "Authentication" },
    description: {
      de: "Multi-Faktor-Authentifizierung, Zugriffskontrollen und Asset-Management",
      en: "Multi-factor authentication, access controls, and asset management",
    },
    articleRef: "Art. 21(2)(i)",
    icon: "Fingerprint",
    isFree: true,
    questions: [
      {
        id: "au-001",
        text: {
          de: "Ist Multi-Faktor-Authentifizierung (MFA) für alle kritischen Systeme implementiert?",
          en: "Is multi-factor authentication (MFA) implemented for all critical systems?",
        },
        helpText: {
          de: "MFA ist eine der wirksamsten Maßnahmen gegen Identitätsdiebstahl. NIS2 nennt MFA ausdrücklich als erforderliche Maßnahme.",
          en: "MFA is one of the most effective measures against identity theft. NIS2 explicitly mentions MFA as a required measure.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(i) EU 2022/2555",
      },
      {
        id: "au-002",
        text: {
          de: "Gibt es eine dokumentierte Zugriffskontrollrichtlinie?",
          en: "Is there a documented access control policy?",
        },
        helpText: {
          de: "Zugriffskontrolle nach dem Least-Privilege-Prinzip: Jeder Benutzer erhält nur die minimal notwendigen Berechtigungen.",
          en: "Access control based on the least privilege principle: Each user receives only the minimum necessary permissions.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(i) EU 2022/2555",
      },
      {
        id: "au-003",
        text: {
          de: "Werden Zugriffsrechte regelmäßig überprüft und angepasst (Rezertifizierung)?",
          en: "Are access rights regularly reviewed and adjusted (recertification)?",
        },
        helpText: {
          de: "Regelmäßige Rezertifizierung verhindert die Ansammlung unnötiger Berechtigungen und reduziert das Risiko bei kompromittierten Konten.",
          en: "Regular recertification prevents the accumulation of unnecessary permissions and reduces risk from compromised accounts.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(i) EU 2022/2555",
      },
      {
        id: "au-004",
        text: {
          de: "Ist ein Verfahren zur Aufgabentrennung (Separation of Duties) implementiert?",
          en: "Is a procedure for separation of duties implemented?",
        },
        helpText: {
          de: "Aufgabentrennung verhindert, dass eine einzelne Person kritische Operationen allein durchführen kann.",
          en: "Separation of duties prevents a single person from being able to perform critical operations alone.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(i) EU 2022/2555",
      },
      {
        id: "au-005",
        text: {
          de: "Wird eine vollständige Asset-Inventarisierung gepflegt?",
          en: "Is a comprehensive asset inventory maintained?",
        },
        helpText: {
          de: "Man kann nur schützen, was man kennt. Eine aktuelle Inventarisierung aller IT-Assets ist die Grundlage jeder Sicherheitsstrategie.",
          en: "You can only protect what you know. A current inventory of all IT assets is the foundation of any security strategy.",
        },
        severity: "mittel",
        legalReference: "Art. 21(2)(i) EU 2022/2555",
      },
    ],
  },
  {
    id: "communication",
    name: { de: "Kommunikation", en: "Communication" },
    description: {
      de: "Gesicherte Sprach-, Video- und Textkommunikation und Notfall-Kommunikationssysteme",
      en: "Secured voice, video, and text communication and emergency communication systems",
    },
    articleRef: "Art. 21(2)(j)",
    icon: "Radio",
    isFree: false,
    questions: [
      {
        id: "co-001",
        text: {
          de: "Gibt es gesicherte Kommunikationssysteme für den Notfall?",
          en: "Are there secured emergency communication systems?",
        },
        helpText: {
          de: "Im Krisenfall müssen sichere Kommunikationskanäle verfügbar sein, die unabhängig von der kompromittierten Infrastruktur funktionieren.",
          en: "In a crisis, secure communication channels must be available that operate independently of the compromised infrastructure.",
        },
        severity: "kritisch",
        legalReference: "Art. 21(2)(j) EU 2022/2555",
      },
      {
        id: "co-002",
        text: {
          de: "Sind Sprach-, Video- und Textkommunikation verschlüsselt?",
          en: "Are voice, video, and text communications encrypted?",
        },
        helpText: {
          de: "Ende-zu-Ende-Verschlüsselung für alle Kommunikationskanäle schützt vertrauliche Geschäftsinformationen.",
          en: "End-to-end encryption for all communication channels protects confidential business information.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(j) EU 2022/2555",
      },
      {
        id: "co-003",
        text: {
          de: "Gibt es einen Kommunikationsplan für Sicherheitsvorfälle?",
          en: "Is there a communication plan for security incidents?",
        },
        helpText: {
          de: "Ein Kommunikationsplan definiert, wer wann und wie informiert wird: Mitarbeiter, Kunden, Behörden, Presse.",
          en: "A communication plan defines who is informed when and how: employees, customers, authorities, press.",
        },
        severity: "hoch",
        legalReference: "Art. 21(2)(j) EU 2022/2555",
      },
      {
        id: "co-004",
        text: {
          de: "Sind alternative Kommunikationswege für den Ausfall der Primärsysteme definiert?",
          en: "Are alternative communication channels defined for primary system failure?",
        },
        helpText: {
          de: "Falls E-Mail und Telefon ausfallen: Welche Alternativen gibt es? Satellitentelefone, Messenger-Dienste, physische Treffpunkte.",
          en: "If email and phone fail: What alternatives exist? Satellite phones, messenger services, physical meeting points.",
        },
        severity: "mittel",
        legalReference: "Art. 21(2)(j) EU 2022/2555",
      },
    ],
  },
];

export const QUICK_CHECK_QUESTION_IDS = [
  "rm-001",
  "ih-001",
  "au-001",
  "bc-001",
  "cr-001",
];

export function getQuestionById(questionId: string): NIS2Question | undefined {
  for (const category of NIS2_CATEGORIES) {
    const question = category.questions.find((q) => q.id === questionId);
    if (question) return question;
  }
  return undefined;
}

export function getCategoryById(categoryId: string): NIS2Category | undefined {
  return NIS2_CATEGORIES.find((c) => c.id === categoryId);
}

export function getCategoryForQuestion(questionId: string): NIS2Category | undefined {
  return NIS2_CATEGORIES.find((c) =>
    c.questions.some((q) => q.id === questionId)
  );
}

export function getTotalQuestionCount(): number {
  return NIS2_CATEGORIES.reduce((sum, c) => sum + c.questions.length, 0);
}
