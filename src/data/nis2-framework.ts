export type Severity = "kritisch" | "hoch" | "mittel";
export type AnswerValue = "fulfilled" | "partial" | "not_fulfilled" | "not_applicable";

export interface NIS2Question {
  id: string;
  text: { de: string; en: string };
  helpText: { de: string; en: string };
  recommendation: { de: string; en: string };
  severity: Severity;
  legalReference: string;
  industries?: string[];
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
        recommendation: {
          de: "Beginnen Sie mit der Erstellung eines ISMS-Handbuchs auf Basis von ISO 27001. Definieren Sie den Geltungsbereich, erstellen Sie eine Informationssicherheitsleitlinie und benennen Sie einen ISMS-Verantwortlichen. Nutzen Sie ein ISMS-Tool wie Verinice oder i-doit zur Dokumentation.",
          en: "Start by creating an ISMS manual based on ISO 27001. Define the scope, create an information security policy, and appoint an ISMS manager. Use an ISMS tool such as Verinice or i-doit for documentation.",
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
        recommendation: {
          de: "Führen Sie eine initiale Risikoanalyse mit einer anerkannten Methode durch (z.B. BSI-Grundschutz, OCTAVE oder FAIR). Erstellen Sie ein Risikoregister in einer zentralen Datenbank und planen Sie vierteljährliche Reviews ein. Dokumentieren Sie jede Analyse mit Datum, Teilnehmern und Ergebnissen.",
          en: "Conduct an initial risk analysis using a recognized methodology (e.g., BSI baseline protection, OCTAVE, or FAIR). Create a risk register in a central database and schedule quarterly reviews. Document each analysis with date, participants, and results.",
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
        recommendation: {
          de: "Erstellen Sie für jedes identifizierte Risiko im Risikoregister einen konkreten Behandlungsplan mit Verantwortlichem, Frist und Budget. Priorisieren Sie nach Risikowert (Eintrittswahrscheinlichkeit x Schadenshöhe). Tracken Sie den Umsetzungsfortschritt monatlich in einem Statusbericht an die Geschäftsführung.",
          en: "Create a specific treatment plan for each identified risk in the risk register, including responsible person, deadline, and budget. Prioritize by risk value (probability x impact). Track implementation progress monthly in a status report to management.",
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
        recommendation: {
          de: "Erstellen Sie ein RACI-Diagramm (Responsible, Accountable, Consulted, Informed) für alle Sicherheitsaufgaben. Benennen Sie einen CISO mit direkter Berichtslinie zur Geschäftsführung. Dokumentieren Sie Stellenbeschreibungen mit konkreten Sicherheitsverantwortlichkeiten und verankern Sie diese in den Arbeitsverträgen.",
          en: "Create a RACI chart (Responsible, Accountable, Consulted, Informed) for all security tasks. Appoint a CISO with a direct reporting line to management. Document job descriptions with specific security responsibilities and anchor these in employment contracts.",
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
        recommendation: {
          de: "Legen Sie einen festen jährlichen Termin für die Risikobewertung fest und tragen Sie ihn im Unternehmenskalender ein. Definieren Sie zusätzlich Trigger-Events (z.B. neue Systeme, Sicherheitsvorfälle, organisatorische Änderungen), die eine außerplanmäßige Neubewertung auslösen. Nutzen Sie ein Ticketsystem zur automatischen Erinnerung.",
          en: "Set a fixed annual date for risk assessment and add it to the corporate calendar. Additionally, define trigger events (e.g., new systems, security incidents, organizational changes) that initiate an unscheduled reassessment. Use a ticketing system for automatic reminders.",
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
        recommendation: {
          de: "Erstellen Sie einen Incident-Response-Plan basierend auf dem NIST SP 800-61 Framework mit den Phasen: Vorbereitung, Erkennung & Analyse, Eindämmung, Beseitigung, Wiederherstellung und Lessons Learned. Definieren Sie klare Klassifizierungsstufen (P1-P4) und zugehörige Reaktionszeiten. Drucken Sie den Plan auch physisch aus für den Notfall.",
          en: "Create an incident response plan based on the NIST SP 800-61 framework with phases: preparation, detection & analysis, containment, eradication, recovery, and lessons learned. Define clear classification levels (P1-P4) and associated response times. Also print the plan physically for emergencies.",
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
        recommendation: {
          de: "Erstellen Sie vorausgefüllte Meldeformulare für das BSI und die zuständige Aufsichtsbehörde. Definieren Sie einen 24/7-erreichbaren Meldeverantwortlichen mit Stellvertretung. Richten Sie eine automatisierte Erinnerung ein, die nach Vorfallserkennung die 24h- und 72h-Fristen überwacht. Üben Sie den Meldeprozess mindestens halbjährlich.",
          en: "Create pre-filled reporting forms for the relevant authority (e.g., BSI). Define a 24/7 reachable reporting officer with a deputy. Set up automated reminders that monitor the 24h and 72h deadlines after incident detection. Practice the reporting process at least semi-annually.",
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
        recommendation: {
          de: "Planen Sie mindestens zwei Tabletop-Übungen pro Jahr mit verschiedenen Szenarien (z.B. Ransomware, Datenleck, DDoS). Beziehen Sie alle relevanten Abteilungen ein (IT, Recht, Kommunikation, Geschäftsführung). Dokumentieren Sie die Ergebnisse und leiten Sie konkrete Verbesserungsmaßnahmen ab. Führen Sie jährlich eine vollständige Simulation durch.",
          en: "Schedule at least two tabletop exercises per year with different scenarios (e.g., ransomware, data breach, DDoS). Involve all relevant departments (IT, legal, communications, management). Document results and derive specific improvement measures. Conduct a full simulation annually.",
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
        recommendation: {
          de: "Führen Sie ein zentrales Incident-Tracking-System ein (z.B. TheHive, JIRA Service Management oder ServiceNow). Erfassen Sie für jeden Vorfall: Zeitstempel, Klassifizierung, betroffene Systeme, ergriffene Maßnahmen und Auswirkungen. Erstellen Sie nach jedem signifikanten Vorfall einen Post-Incident-Review-Bericht mit Lessons Learned.",
          en: "Implement a central incident tracking system (e.g., TheHive, JIRA Service Management, or ServiceNow). Record for each incident: timestamps, classification, affected systems, actions taken, and impact. Create a post-incident review report with lessons learned after each significant incident.",
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
        recommendation: {
          de: "Erstellen Sie eine visuelle Eskalationsmatrix mit Kontaktdaten (Telefon, E-Mail, Messenger) für jede Stufe. Definieren Sie Schwellenwerte, ab wann welche Ebene informiert werden muss. Hinterlegen Sie die Kontaktliste auch offline (Ausdruck, Notfall-Handy). Aktualisieren Sie die Liste bei jedem Personalwechsel und prüfen Sie sie vierteljährlich.",
          en: "Create a visual escalation matrix with contact details (phone, email, messenger) for each level. Define thresholds for when each level must be informed. Store the contact list offline as well (printout, emergency phone). Update the list with every personnel change and review it quarterly.",
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
        recommendation: {
          de: "Führen Sie zunächst eine Business-Impact-Analyse (BIA) durch, um kritische Geschäftsprozesse zu identifizieren. Erstellen Sie darauf basierend einen BCP nach ISO 22301 mit konkreten Wiederanlaufplänen für jedes kritische System. Definieren Sie Notbetriebsverfahren für die wichtigsten Prozesse und testen Sie den Plan mindestens jährlich.",
          en: "First conduct a Business Impact Analysis (BIA) to identify critical business processes. Based on this, create a BCP following ISO 22301 with specific recovery plans for each critical system. Define emergency operating procedures for the most important processes and test the plan at least annually.",
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
        recommendation: {
          de: "Implementieren Sie die 3-2-1-1-Regel: 3 Kopien, 2 verschiedene Medien, 1 offsite, 1 offline (air-gapped gegen Ransomware). Verschlüsseln Sie alle Backups mit AES-256. Automatisieren Sie die Backup-Erstellung und richten Sie eine Monitoring-Lösung ein, die bei fehlgeschlagenen Backups sofort alarmiert. Dokumentieren Sie die Backup-Strategie schriftlich.",
          en: "Implement the 3-2-1-1 rule: 3 copies, 2 different media, 1 offsite, 1 offline (air-gapped against ransomware). Encrypt all backups with AES-256. Automate backup creation and set up a monitoring solution that immediately alerts on failed backups. Document the backup strategy in writing.",
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
        recommendation: {
          de: "Erstellen Sie einen Restore-Testplan mit monatlichen Tests einzelner Systeme und halbjährlichen vollständigen Wiederherstellungstests. Messen Sie die tatsächliche Wiederherstellungszeit und vergleichen Sie sie mit den definierten RTO-Werten. Dokumentieren Sie jeden Test mit Ergebnis, Dauer und aufgetretenen Problemen. Nutzen Sie isolierte Testumgebungen für die Wiederherstellung.",
          en: "Create a restore test plan with monthly tests of individual systems and semi-annual full recovery tests. Measure actual recovery time and compare it with defined RTO values. Document each test with results, duration, and issues encountered. Use isolated test environments for recovery.",
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
        recommendation: {
          de: "Definieren Sie RPO und RTO für jedes kritische System basierend auf der Business-Impact-Analyse. Erstellen Sie einen DR-Plan mit konkreten Schritt-für-Schritt-Anleitungen für verschiedene Ausfallszenarien (Rechenzentrum, Cloud, Netzwerk). Richten Sie ein DR-Standort oder Cloud-basiertes Failover ein und testen Sie Failover/Failback-Prozesse halbjährlich.",
          en: "Define RPO and RTO for each critical system based on the Business Impact Analysis. Create a DR plan with specific step-by-step instructions for different failure scenarios (data center, cloud, network). Set up a DR site or cloud-based failover and test failover/failback processes semi-annually.",
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
        recommendation: {
          de: "Benennen Sie ein Krisenmanagement-Team mit Vertretern aus IT, Management, Recht, Kommunikation und Fachabteilungen. Definieren Sie klare Rollen (Krisenleiter, Kommunikation, Technik) und stellen Sie Stellvertretungen sicher. Schulen Sie das Team halbjährlich mit realistischen Szenarien und dokumentieren Sie die Übungsergebnisse. Stellen Sie einen Krisenraum mit notwendiger Ausstattung bereit.",
          en: "Appoint a crisis management team with representatives from IT, management, legal, communications, and business departments. Define clear roles (crisis leader, communications, technical) and ensure deputies are assigned. Train the team semi-annually with realistic scenarios and document exercise results. Provide a crisis room with necessary equipment.",
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
        recommendation: {
          de: "Erstellen Sie einen standardisierten Fragebogen zur Sicherheitsbewertung von Lieferanten (basierend auf SIG oder CAIQ). Kategorisieren Sie Lieferanten nach Kritikalität (Tier 1-3) und passen Sie die Bewertungstiefe entsprechend an. Fordern Sie Zertifizierungen (ISO 27001, SOC 2) an und führen Sie für Tier-1-Lieferanten jährliche Vor-Ort-Audits durch.",
          en: "Create a standardized security assessment questionnaire for suppliers (based on SIG or CAIQ). Categorize suppliers by criticality (Tier 1-3) and adjust assessment depth accordingly. Request certifications (ISO 27001, SOC 2) and conduct annual on-site audits for Tier 1 suppliers.",
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
        recommendation: {
          de: "Erstellen Sie standardisierte Sicherheitsklauseln als Vertragsanhang, die folgende Punkte abdecken: Einhaltung definierter Sicherheitsstandards, Audit-Rechte mit mindestens 30 Tagen Vorankündigung, Meldepflicht bei Sicherheitsvorfällen innerhalb von 24 Stunden, Datenschutz-Vereinbarungen (AVV) und Exit-Regelungen. Lassen Sie bestehende Verträge durch die Rechtsabteilung prüfen und nachverhandeln.",
          en: "Create standardized security clauses as contract annexes covering: compliance with defined security standards, audit rights with at least 30 days notice, incident reporting obligation within 24 hours, data protection agreements, and exit provisions. Have existing contracts reviewed and renegotiated by the legal department.",
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
        recommendation: {
          de: "Implementieren Sie ein kontinuierliches Lieferanten-Monitoring mit Tools wie SecurityScorecard, BitSight oder RiskRecon. Führen Sie jährliche Re-Assessments für kritische Lieferanten durch und nutzen Sie Bedrohungsintelligenz-Feeds, um neue Risiken in der Lieferkette frühzeitig zu erkennen. Erstellen Sie ein Lieferanten-Dashboard mit aktuellen Sicherheitsbewertungen.",
          en: "Implement continuous supplier monitoring with tools like SecurityScorecard, BitSight, or RiskRecon. Conduct annual re-assessments for critical suppliers and use threat intelligence feeds to identify new supply chain risks early. Create a supplier dashboard with current security ratings.",
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
        recommendation: {
          de: "Identifizieren Sie für jeden kritischen Lieferanten mindestens einen alternativen Anbieter und dokumentieren Sie Umstiegspläne. Definieren Sie maximale Ausfallzeiten und Überbrückungsmaßnahmen (z.B. manuelle Prozesse). Erstellen Sie Exit-Pläne mit Datenportabilität und Übergangszeiträumen. Testen Sie die Umschaltung auf alternative Lieferanten mindestens jährlich im Rahmen einer Übung.",
          en: "Identify at least one alternative provider for each critical supplier and document migration plans. Define maximum downtime and bridging measures (e.g., manual processes). Create exit plans with data portability and transition periods. Test the switchover to alternative suppliers at least annually as part of an exercise.",
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
        recommendation: {
          de: "Integrieren Sie Sicherheitsprüfungen in den Deployment-Prozess als verpflichtenden Gate-Check. Erstellen Sie eine Checkliste mit Mindestanforderungen: Schwachstellenscan, Konfigurationsreview, Härtung nach CIS Benchmarks und Code-Review für eigenentwickelte Software. Nutzen Sie automatisierte SAST/DAST-Tools in der CI/CD-Pipeline und erlauben Sie kein Deployment ohne bestandene Sicherheitsprüfung.",
          en: "Integrate security checks into the deployment process as a mandatory gate check. Create a checklist with minimum requirements: vulnerability scan, configuration review, hardening per CIS Benchmarks, and code review for custom software. Use automated SAST/DAST tools in the CI/CD pipeline and do not allow deployment without passing security checks.",
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
        recommendation: {
          de: "Definieren Sie einen Patch-Management-Prozess mit klaren SLAs: Kritische Patches innerhalb von 24 Stunden, hohe innerhalb von 72 Stunden, mittlere innerhalb von 30 Tagen. Nutzen Sie ein zentrales Patch-Management-Tool (z.B. WSUS, Ivanti, ManageEngine). Erstellen Sie ein vollständiges Inventar aller Software und ihrer Versionen. Richten Sie automatisierte Benachrichtigungen für neue Sicherheitsupdates ein.",
          en: "Define a patch management process with clear SLAs: critical patches within 24 hours, high within 72 hours, medium within 30 days. Use a central patch management tool (e.g., WSUS, Ivanti, ManageEngine). Create a complete inventory of all software and versions. Set up automated notifications for new security updates.",
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
        recommendation: {
          de: "Implementieren Sie eine Netzwerksegmentierung basierend auf Zonen (DMZ, intern, Management, OT). Setzen Sie Next-Generation-Firewalls an den Zonenübergängen ein. Implementieren Sie ein SIEM-System (z.B. Splunk, Elastic SIEM, Microsoft Sentinel) zur zentralen Überwachung. Definieren Sie Use Cases und Alarmregeln für verdächtige Netzwerkaktivitäten und überprüfen Sie die Segmentierung halbjährlich.",
          en: "Implement network segmentation based on zones (DMZ, internal, management, OT). Deploy next-generation firewalls at zone boundaries. Implement a SIEM system (e.g., Splunk, Elastic SIEM, Microsoft Sentinel) for central monitoring. Define use cases and alert rules for suspicious network activities and review segmentation semi-annually.",
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
        recommendation: {
          de: "Beauftragen Sie mindestens jährlich einen externen Penetrationstest durch einen zertifizierten Dienstleister (OSCP, CREST). Wechseln Sie den Anbieter alle 2-3 Jahre für frische Perspektiven. Definieren Sie den Scope klar (extern, intern, Web-Apps, Social Engineering) und stellen Sie sicher, dass die Ergebnisse priorisiert und innerhalb definierter Fristen behoben werden. Führen Sie Re-Tests nach der Behebung durch.",
          en: "Commission at least an annual external penetration test by a certified provider (OSCP, CREST). Rotate providers every 2-3 years for fresh perspectives. Clearly define the scope (external, internal, web apps, social engineering) and ensure results are prioritized and remediated within defined timelines. Conduct re-tests after remediation.",
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
        recommendation: {
          de: "Veröffentlichen Sie eine security.txt-Datei unter /.well-known/security.txt auf Ihrer Website gemäß RFC 9116. Erstellen Sie eine Vulnerability-Disclosure-Policy, die den Meldeprozess, erwartete Reaktionszeiten und den Schutz gutgläubiger Melder beschreibt. Richten Sie eine dedizierte E-Mail-Adresse (security@firma.de) ein und definieren Sie intern einen Prozess zur Bewertung und Behebung gemeldeter Schwachstellen.",
          en: "Publish a security.txt file at /.well-known/security.txt on your website per RFC 9116. Create a Vulnerability Disclosure Policy describing the reporting process, expected response times, and protection for good-faith reporters. Set up a dedicated email address (security@company.com) and define an internal process for evaluating and remediating reported vulnerabilities.",
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
        recommendation: {
          de: "Erstellen Sie einen jährlichen Auditplan, der alle Bereiche des ISMS abdeckt. Schulen Sie interne Auditoren oder beauftragen Sie einen externen Prüfer. Nutzen Sie eine strukturierte Audit-Checkliste basierend auf ISO 27001 Annex A. Dokumentieren Sie Feststellungen in einem Audit-Bericht mit Maßnahmenplan und Fristen. Verfolgen Sie die Umsetzung der Maßnahmen im Management-Review.",
          en: "Create an annual audit plan covering all areas of the ISMS. Train internal auditors or commission an external auditor. Use a structured audit checklist based on ISO 27001 Annex A. Document findings in an audit report with action plan and deadlines. Track the implementation of measures in the management review.",
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
        recommendation: {
          de: "Definieren Sie mindestens 5-10 Kern-KPIs: MTTD (Mean Time to Detect), MTTR (Mean Time to Respond), Patch-Abdeckungsrate, Anzahl offener Schwachstellen nach Schweregrad, Schulungsabschlussrate, Phishing-Klickrate und Anzahl der Sicherheitsvorfälle. Erstellen Sie ein monatliches Security-Dashboard und präsentieren Sie die KPIs vierteljährlich der Geschäftsführung.",
          en: "Define at least 5-10 core KPIs: MTTD (Mean Time to Detect), MTTR (Mean Time to Respond), patch coverage rate, number of open vulnerabilities by severity, training completion rate, phishing click rate, and number of security incidents. Create a monthly security dashboard and present KPIs to management quarterly.",
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
        recommendation: {
          de: "Nutzen Sie ein zentrales Maßnahmen-Tracking-System (z.B. JIRA, Confluence oder ein GRC-Tool wie Verinice). Erfassen Sie jede Audit-Feststellung mit Schweregrad, Verantwortlichem, Frist und Status. Implementieren Sie automatische Eskalation bei überfälligen Maßnahmen. Erstellen Sie einen monatlichen Statusbericht und integrieren Sie offene Feststellungen in das Management-Review.",
          en: "Use a central action tracking system (e.g., JIRA, Confluence, or a GRC tool like Verinice). Record each audit finding with severity, responsible person, deadline, and status. Implement automatic escalation for overdue actions. Create a monthly status report and integrate open findings into the management review.",
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
        recommendation: {
          de: "Planen Sie vierteljährliche Management-Reviews als festen Termin im Vorstandskalender ein. Bereiten Sie eine standardisierte Agenda vor: KPI-Übersicht, Vorfallsbericht, Audit-Ergebnisse, Risikostatus, Budget-Übersicht und Entscheidungsvorlagen. Dokumentieren Sie die Beschlüsse und verfolgen Sie die zugewiesenen Maßnahmen. Stellen Sie sicher, dass die Geschäftsführung die Protokolle unterzeichnet als Nachweis der NIS2-Pflichterfüllung.",
          en: "Schedule quarterly management reviews as fixed appointments in the board calendar. Prepare a standardized agenda: KPI overview, incident report, audit results, risk status, budget overview, and decision proposals. Document decisions and track assigned actions. Ensure management signs the minutes as evidence of NIS2 compliance.",
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
        recommendation: {
          de: "Führen Sie ein Kryptografie-Inventar aller eingesetzten Algorithmen und Protokolle durch. Identifizieren und ersetzen Sie veraltete Verfahren: Migrieren Sie auf TLS 1.3, AES-256 für Verschlüsselung, SHA-256/SHA-3 für Hashing und RSA-4096/ECDSA für Signaturen. Deaktivieren Sie TLS 1.0/1.1, SSLv3, DES, 3DES und MD5 auf allen Systemen. Nutzen Sie Tools wie SSL Labs oder testssl.sh zur Überprüfung.",
          en: "Conduct a cryptography inventory of all algorithms and protocols in use. Identify and replace outdated methods: migrate to TLS 1.3, AES-256 for encryption, SHA-256/SHA-3 for hashing, and RSA-4096/ECDSA for signatures. Disable TLS 1.0/1.1, SSLv3, DES, 3DES, and MD5 on all systems. Use tools like SSL Labs or testssl.sh for verification.",
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
        recommendation: {
          de: "Erstellen Sie eine Verschlüsselungsrichtlinie, die klar definiert: Welche Datenklassen verschlüsselt werden müssen (personenbezogene Daten, Geschäftsgeheimnisse, Finanzdaten), zugelassene Algorithmen und Schlüssellängen, Anforderungen für Data-at-Rest (Festplattenverschlüsselung, Datenbankverschlüsselung) und Data-in-Transit (TLS, VPN). Schulen Sie alle Entwickler und Administratoren zu dieser Richtlinie.",
          en: "Create an encryption policy that clearly defines: which data classes must be encrypted (personal data, trade secrets, financial data), approved algorithms and key lengths, requirements for data at rest (disk encryption, database encryption) and data in transit (TLS, VPN). Train all developers and administrators on this policy.",
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
        recommendation: {
          de: "Implementieren Sie ein zentrales Key-Management-System, idealerweise mit Hardware Security Modules (HSMs) für kritische Schlüssel. Definieren Sie Prozesse für Schlüsselerzeugung (mit ausreichender Entropie), sichere Speicherung (niemals im Klartext im Code), regelmäßige Rotation (mindestens jährlich) und sichere Vernichtung. Nutzen Sie Cloud-KMS-Dienste (AWS KMS, Azure Key Vault) oder On-Premises-Lösungen wie HashiCorp Vault.",
          en: "Implement a central key management system, ideally with Hardware Security Modules (HSMs) for critical keys. Define processes for key generation (with sufficient entropy), secure storage (never in plaintext in code), regular rotation (at least annually), and secure destruction. Use cloud KMS services (AWS KMS, Azure Key Vault) or on-premises solutions like HashiCorp Vault.",
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
        recommendation: {
          de: "Führen Sie jährliche Reviews aller eingesetzten Kryptografie durch und vergleichen Sie diese mit aktuellen BSI- und NIST-Empfehlungen. Beginnen Sie bereits jetzt mit der Planung der Post-Quanten-Migration: Inventarisieren Sie alle kryptografischen Assets und evaluieren Sie Post-Quanten-Algorithmen (CRYSTALS-Kyber, CRYSTALS-Dilithium). Abonnieren Sie Sicherheits-Advisories für eingesetzte Kryptobibliotheken.",
          en: "Conduct annual reviews of all cryptography in use and compare against current BSI and NIST recommendations. Start planning the post-quantum migration now: inventory all cryptographic assets and evaluate post-quantum algorithms (CRYSTALS-Kyber, CRYSTALS-Dilithium). Subscribe to security advisories for cryptographic libraries in use.",
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
        recommendation: {
          de: "Implementieren Sie ein ganzjähriges Security-Awareness-Programm mit monatlichen kurzen Lerneinheiten (Microlearning), ergänzt durch eine umfassende jährliche Pflichtschulung. Nutzen Sie eine E-Learning-Plattform (z.B. KnowBe4, Proofpoint, oder SoSafe) mit interaktiven Inhalten. Tracken Sie die Teilnahme zentral und eskalieren Sie bei Nichtteilnahme. Passen Sie Inhalte an aktuelle Bedrohungen an.",
          en: "Implement a year-round security awareness program with monthly short learning units (microlearning), supplemented by a comprehensive annual mandatory training. Use an e-learning platform (e.g., KnowBe4, Proofpoint, or SoSafe) with interactive content. Track participation centrally and escalate non-participation. Adapt content to current threats.",
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
        recommendation: {
          de: "Organisieren Sie halbjährliche Executive-Briefings zur Cybersicherheitslage mit konkreten Praxisbeispielen und Haftungsszenarien. Bieten Sie der Geschäftsführung ein individuelles Coaching zu aktuellen Bedrohungen an. Schulen Sie explizit zur persönlichen Haftung nach NIS2 Art. 20(2) und BSIG. Dokumentieren Sie alle Schulungsteilnahmen als Nachweis der Sorgfaltspflicht. Nutzen Sie externe Referenten für höhere Aufmerksamkeit.",
          en: "Organize semi-annual executive briefings on the cybersecurity situation with practical examples and liability scenarios. Offer management individual coaching on current threats. Explicitly train on personal liability under NIS2 Art. 20(2). Document all training participation as evidence of due diligence. Use external speakers for greater attention.",
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
        recommendation: {
          de: "Führen Sie monatliche Phishing-Simulationen mit steigendem Schwierigkeitsgrad durch. Variieren Sie die Angriffsvektoren: E-Mail-Phishing, Spear-Phishing, Vishing (Telefonanrufe) und Smishing (SMS). Bieten Sie bei Fehlverhalten sofortiges Just-in-Time-Training an statt Bestrafung. Messen Sie die Klickrate über Zeit und setzen Sie ein realistisches Reduktionsziel (z.B. unter 5%). Berichten Sie die Ergebnisse anonymisiert an die Geschäftsführung.",
          en: "Conduct monthly phishing simulations with increasing difficulty. Vary attack vectors: email phishing, spear phishing, vishing (phone calls), and smishing (SMS). Offer immediate just-in-time training for failures instead of punishment. Measure click rates over time and set a realistic reduction target (e.g., below 5%). Report results anonymously to management.",
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
        recommendation: {
          de: "Erstellen Sie ein kompaktes Cyberhygiene-Handbuch (max. 10 Seiten) mit konkreten Regeln: Passwortrichtlinie (min. 12 Zeichen, Passwortmanager), Clean-Desk-Policy, Bildschirmsperre (max. 5 Min.), sicheres WLAN-Verhalten, Umgang mit USB-Sticks und Meldewege für verdächtige E-Mails. Verteilen Sie das Handbuch an alle neuen Mitarbeiter im Onboarding und machen Sie es leicht auffindbar im Intranet.",
          en: "Create a compact cyber hygiene handbook (max. 10 pages) with specific rules: password policy (min. 12 characters, password manager), clean desk policy, screen lock (max. 5 min.), secure WiFi behavior, handling of USB drives, and reporting paths for suspicious emails. Distribute the handbook to all new employees during onboarding and make it easily accessible on the intranet.",
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
        recommendation: {
          de: "Rollen Sie MFA schrittweise aus: Zuerst für alle Admin-Zugänge und VPN, dann für E-Mail und Cloud-Dienste, schließlich für alle Systeme. Bevorzugen Sie FIDO2/WebAuthn-Schlüssel oder Authenticator-Apps gegenüber SMS-basierter MFA. Implementieren Sie Conditional Access Policies, die MFA risikobasiert erzwingen. Erstellen Sie einen Rollout-Plan mit Zeitschiene und kommunizieren Sie die Änderungen frühzeitig an alle Mitarbeiter.",
          en: "Roll out MFA in phases: first for all admin access and VPN, then for email and cloud services, finally for all systems. Prefer FIDO2/WebAuthn keys or authenticator apps over SMS-based MFA. Implement conditional access policies that enforce MFA risk-based. Create a rollout plan with timeline and communicate changes to all employees early.",
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
        recommendation: {
          de: "Erstellen Sie eine Zugriffskontrollrichtlinie, die das Least-Privilege-Prinzip und Need-to-Know als Grundsätze verankert. Definieren Sie rollenbasierte Zugriffsprofile (RBAC) für alle Systeme. Implementieren Sie einen formalen Beantragungsprozess für Zugriffsrechte mit Genehmigung durch den Dateneigentümer. Deaktivieren Sie Zugriffe automatisch bei Abteilungswechsel oder Austritt. Verbieten Sie geteilte Accounts und generische Passwörter.",
          en: "Create an access control policy that anchors least privilege and need-to-know as principles. Define role-based access profiles (RBAC) for all systems. Implement a formal request process for access rights with approval by the data owner. Automatically deactivate access upon department change or departure. Prohibit shared accounts and generic passwords.",
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
        recommendation: {
          de: "Implementieren Sie einen vierteljährlichen Rezertifizierungsprozess für privilegierte Zugänge und einen halbjährlichen für Standardzugänge. Senden Sie automatisierte Rezertifizierungsanfragen an die jeweiligen Vorgesetzten über ein IAM-Tool (z.B. SailPoint, OneIdentity). Entziehen Sie nicht bestätigte Rechte automatisch nach einer Frist von 14 Tagen. Erstellen Sie einen Bericht über Rechteveränderungen und bereinigte Altlasten.",
          en: "Implement a quarterly recertification process for privileged access and semi-annual for standard access. Send automated recertification requests to respective managers via an IAM tool (e.g., SailPoint, OneIdentity). Automatically revoke unconfirmed rights after a 14-day period. Create a report on access changes and cleaned up legacy permissions.",
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
        recommendation: {
          de: "Identifizieren Sie alle kritischen Prozesse, bei denen eine Aufgabentrennung notwendig ist (z.B. Zahlungsfreigabe, Systemadministration, Benutzerverwaltung). Implementieren Sie das Vier-Augen-Prinzip technisch durch Dual-Authorization in Systemen. Dokumentieren Sie inkompatible Rollen in einer SoD-Matrix und prüfen Sie diese automatisiert mit IAM-Tools. Überprüfen Sie die Wirksamkeit der Aufgabentrennung im Rahmen jedes internen Audits.",
          en: "Identify all critical processes where separation of duties is necessary (e.g., payment approval, system administration, user management). Implement the four-eyes principle technically through dual authorization in systems. Document incompatible roles in an SoD matrix and verify these automatically with IAM tools. Review the effectiveness of separation of duties as part of each internal audit.",
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
        recommendation: {
          de: "Implementieren Sie ein Asset-Management-Tool (z.B. Lansweeper, GLPI, Snipe-IT) für die automatische Erkennung und Inventarisierung aller IT-Assets. Erfassen Sie für jedes Asset: Eigentümer, Klassifizierung, Standort, Software-Version und Patch-Stand. Führen Sie vierteljährliche Abgleiche zwischen Inventar und tatsächlichem Bestand durch. Integrieren Sie das Asset-Management mit dem CMDB und Vulnerability-Scanner.",
          en: "Implement an asset management tool (e.g., Lansweeper, GLPI, Snipe-IT) for automatic discovery and inventory of all IT assets. Record for each asset: owner, classification, location, software version, and patch status. Conduct quarterly reconciliations between inventory and actual inventory. Integrate asset management with the CMDB and vulnerability scanner.",
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
        recommendation: {
          de: "Beschaffen Sie ein dediziertes Notfall-Kommunikationssystem, das unabhängig von der Unternehmens-IT funktioniert. Optionen sind: verschlüsselte Messenger-Dienste auf separaten Geräten (z.B. Signal auf dedizierten Mobiltelefonen), ein Satellitentelefon für das Krisenteam oder ein cloudbasierter Krisenkommunikationsdienst. Testen Sie die Notfallkommunikation bei jeder Krisenübung und stellen Sie sicher, dass alle Krisenteam-Mitglieder die Tools kennen.",
          en: "Procure a dedicated emergency communication system that operates independently of corporate IT. Options include: encrypted messenger services on separate devices (e.g., Signal on dedicated mobile phones), a satellite phone for the crisis team, or a cloud-based crisis communication service. Test emergency communications during every crisis exercise and ensure all crisis team members know the tools.",
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
        recommendation: {
          de: "Setzen Sie auf Kommunikationsplattformen mit Ende-zu-Ende-Verschlüsselung: Microsoft Teams oder Zoom (mit E2EE aktiviert) für Video, Signal oder Threema Work für Messaging. Erstellen Sie eine Richtlinie, die festlegt, welche Kommunikationstools für welche Vertraulichkeitsstufe zugelassen sind. Deaktivieren Sie unverschlüsselte Kommunikationskanäle (z.B. unverschlüsselte E-Mail für vertrauliche Inhalte) und implementieren Sie S/MIME oder PGP für E-Mail-Verschlüsselung bei Bedarf.",
          en: "Use communication platforms with end-to-end encryption: Microsoft Teams or Zoom (with E2EE enabled) for video, Signal or Threema Work for messaging. Create a policy defining which communication tools are approved for which confidentiality level. Disable unencrypted communication channels (e.g., unencrypted email for confidential content) and implement S/MIME or PGP for email encryption as needed.",
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
        recommendation: {
          de: "Erstellen Sie vorbereitete Kommunikationsvorlagen für verschiedene Vorfallstypen (Datenleck, Ransomware, Systemausfall). Definieren Sie die Kommunikationsreihenfolge: 1. Internes Krisenteam, 2. Geschäftsführung, 3. Betroffene Mitarbeiter, 4. Behörden (BSI/Aufsicht), 5. Betroffene Kunden, 6. Presse. Benennen Sie einen Pressesprecher und schulen Sie diesen für Krisenkommunikation. Lassen Sie alle Vorlagen von der Rechtsabteilung freigeben.",
          en: "Create pre-prepared communication templates for different incident types (data breach, ransomware, system outage). Define communication sequence: 1. Internal crisis team, 2. Management, 3. Affected employees, 4. Authorities, 5. Affected customers, 6. Press. Appoint a spokesperson and train them in crisis communication. Have all templates approved by the legal department.",
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
        recommendation: {
          de: "Definieren Sie mindestens drei alternative Kommunikationswege: 1. Verschlüsselter Messenger auf privaten Mobilgeräten (z.B. Signal-Gruppe des Krisenteams), 2. Prepaid-Mobiltelefone an einem sicheren Ort deponiert, 3. Physischer Treffpunkt mit festgelegten Zeiten. Erstellen Sie eine laminierte Kontaktkarte für jedes Krisenteam-Mitglied mit allen alternativen Kontaktwegen. Testen Sie die alternativen Kanäle vierteljährlich und aktualisieren Sie die Kontaktdaten bei jedem Personalwechsel.",
          en: "Define at least three alternative communication channels: 1. Encrypted messenger on personal mobile devices (e.g., Signal group for crisis team), 2. Prepaid mobile phones stored in a secure location, 3. Physical meeting point with set times. Create a laminated contact card for each crisis team member with all alternative contact methods. Test alternative channels quarterly and update contact details with every personnel change.",
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

export function getQuestionsForIndustry(category: NIS2Category, industry?: string | null): NIS2Question[] {
  if (!industry) {
    return category.questions;
  }
  return category.questions.filter(
    (q) => !q.industries || q.industries.length === 0 || q.industries.includes(industry)
  );
}
