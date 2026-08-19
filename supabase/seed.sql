begin;

insert into public.work_packages (id, code, title, description, status, progress, owner, scope, source_reference) values
('10000000-0000-0000-0000-000000000001', 'AP1', 'Implementierung der Datenpipeline für KDL im VM-Brake-Lab', 'KDL läuft mit dem intern entwickelten TestFrameWork (TFW). Messdaten werden als .dat und .raw lokal gespeichert. Ziel ist die automatisierte KDL-/Amanda- und OEE-Datenstrecke bis Qlik.', 'active', 18, null, 'Highest priority; critical path: Anja Langen and Robin Pierre-Jean.', 'Initial project overview'),
('10000000-0000-0000-0000-000000000002', 'AP2', 'Integration der ProMaster-Daten bzgl. Prüfstands-OEE in das Qlik-Dashboard', 'Discovery phase. ProMaster Data Analysis supports CSV download and graphical analysis in Qlik/PowerBI; further architecture and ownership details need verification.', 'discovery', 5, null, 'Hypothesis – needs verification: ProMaster may be part of the existing SYS-Bench/DASIM/ETL4SYS pipeline. MAP: Unresolved term.', 'Initial project overview'),
('10000000-0000-0000-0000-000000000003', 'AP3', 'ENV-Prüfstände / Klimakammern via PyESPEC an Qlik', 'Initial visibility only; detailed planning has not started.', 'already_in_progress', 0, null, 'Already in progress; display only until scope is clarified.', 'Initial project overview')
on conflict (code) do nothing;

insert into public.stakeholders (id, name, organizational_unit, role, responsibility, notes) values
('20000000-0000-0000-0000-000000000001', 'Naoya Muramatsu', null, 'Auftraggeber / Mentor', null, null),
('20000000-0000-0000-0000-000000000002', 'Anja Langen', 'VM/EMH1-Bh', 'Amanda/KDL Backend', 'Backend der KDL-Amanda-Pipeline', 'Critical path AP1'),
('20000000-0000-0000-0000-000000000003', 'Robin Pierre-Jean', 'VM/EMH1-Bh', 'Entwickler TestFrameWork', 'TestFrameWork technical contact', 'Critical path AP1'),
('20000000-0000-0000-0000-000000000004', 'Stefan Albrecht', 'VM/MFD-J2', 'Datentransfer YHVM20 → iSilon', 'MultiDistribution transfer', null),
('20000000-0000-0000-0000-000000000005', 'Qlik Owner', null, 'Placeholder', 'Qlik ownership and SQL data source', 'unknown'),
('20000000-0000-0000-0000-000000000006', 'OEE / Fach Owner', null, 'Placeholder', 'OEE definition and acceptance', 'unknown'),
('20000000-0000-0000-0000-000000000007', 'Promaster Owner', null, 'Placeholder', 'ProMaster ownership and access', 'unknown'),
('20000000-0000-0000-0000-000000000008', 'IT / Network / Security', null, 'Placeholder', 'Network and firewall requirements', 'unknown')
on conflict (name) do nothing;

insert into public.tasks (work_package_id, task_code, title, description, status, priority, blocking, responsible, dependency, notes, sort_order) values
('10000000-0000-0000-0000-000000000001', 'AP1-T01', 'iSilon-Zielpfad klären', 'Korrektes Ziellaufwerk und Pfad für .dat/.raw festlegen.', 'blocked', 'critical', true, 'Anja Langen', null, null, 10),
('10000000-0000-0000-0000-000000000001', 'AP1-T02', 'Amanda-Pipeline Voraussetzungen klären', null, 'waiting', 'critical', true, 'Anja Langen', 'AP1-T01', null, 20),
('10000000-0000-0000-0000-000000000001', 'AP1-T03', 'Signal- und Alias-Konvention abstimmen', null, 'waiting', 'high', true, 'Robin Pierre-Jean', null, null, 30),
('10000000-0000-0000-0000-000000000001', 'AP1-T04', 'MultiDistribution-Job YHVM20 → iSilon', null, 'open', 'high', false, 'Stefan Albrecht', 'AP1-T01', null, 40),
('10000000-0000-0000-0000-000000000001', 'AP1-T05', 'KDL KPI Dashboard in Qlik aufbauen', null, 'open', 'high', false, 'Qlik Owner', 'Amanda pipeline', null, 50),
('10000000-0000-0000-0000-000000000001', 'AP1-T06', 'Qlik mit SQL-Datenquelle verbinden', null, 'open', 'high', false, 'Qlik Owner', 'Database technology', null, 60),
('10000000-0000-0000-0000-000000000001', 'AP1-T07', 'TFW API für Prüfstandsstatus/OEE prüfen', 'Falls keine API vorhanden ist, Status aus Logs oder Messdaten ableiten.', 'open', 'critical', true, 'Robin Pierre-Jean', null, null, 70),
('10000000-0000-0000-0000-000000000001', 'AP1-T08', 'OEE-Pipeline und Datenbank festlegen', null, 'open', 'high', false, 'OEE / Fach Owner', 'AP1-T07', 'Database technology unknown.', 80),
('10000000-0000-0000-0000-000000000002', 'AP2-T01', 'ProMaster Owner identifizieren', null, 'open', 'critical', true, 'Naoya Muramatsu', null, 'needs verification', 10),
('10000000-0000-0000-0000-000000000002', 'AP2-T02', 'Datenzugriff und Datenformat klären', 'CSV download is known; production integration format is unknown.', 'open', 'high', true, 'Promaster Owner', 'AP2-T01', 'needs verification', 20),
('10000000-0000-0000-0000-000000000002', 'AP2-T03', 'OEE-Definition abstimmen', null, 'open', 'critical', true, 'OEE / Fach Owner', null, 'needs verification', 30),
('10000000-0000-0000-0000-000000000002', 'AP2-T04', 'Integrationsarchitektur verifizieren', 'Prüfen, ob SYS-Bench/DASIM/ETL4SYS-Infrastruktur wiederverwendbar ist.', 'open', 'high', false, null, 'AP2-T01', 'Hypothesis – needs verification', 40)
on conflict (task_code) do nothing;

insert into public.open_questions (work_package_id, question_code, question, stakeholder_id, blocking, status, next_action, notes) values
('10000000-0000-0000-0000-000000000001', 'AP1-Q01', 'Welcher iSilon-Zielpfad ist verbindlich?', '20000000-0000-0000-0000-000000000002', true, 'not_asked', 'Mit Anja Langen klären', null),
('10000000-0000-0000-0000-000000000001', 'AP1-Q02', 'Welche Signal- und Alias-Konvention verlangt die Amanda-Pipeline?', '20000000-0000-0000-0000-000000000003', true, 'not_asked', 'Anja und Robin abstimmen', null),
('10000000-0000-0000-0000-000000000001', 'AP1-Q03', 'Stellt TFW eine API für Prüfstandsstatus und OEE bereit?', '20000000-0000-0000-0000-000000000003', true, 'not_asked', 'TFW-Schnittstellen prüfen', null),
('10000000-0000-0000-0000-000000000002', 'AP2-Q01', 'Wer ist der fachliche und technische ProMaster Owner?', '20000000-0000-0000-0000-000000000007', true, 'not_asked', 'Owner identifizieren', null),
('10000000-0000-0000-0000-000000000002', 'AP2-Q02', 'Wofür steht MAP in der Ausgangsarchitektur?', null, false, 'not_asked', 'Begriff mit Architekturverantwortlichen klären', 'Unresolved term')
on conflict (question_code) do nothing;

insert into public.decisions (work_package_id, decision_code, title, description, options, status, dependent_on, notes) values
('10000000-0000-0000-0000-000000000001', 'AP1-D01', 'iSilon-Zielpfad', 'Verbindlichen Zielpfad bestimmen.', null, 'open', 'Anja Langen', null),
('10000000-0000-0000-0000-000000000001', 'AP1-D02', 'Signal-/Alias-Konvention', null, null, 'open', 'Anja Langen, Robin Pierre-Jean', null),
('10000000-0000-0000-0000-000000000001', 'AP1-D03', 'OEE-Datenquelle', 'TFW API oder Ableitung aus Logs/Messdaten.', '["TFW API", "Logs / measurement data"]'::jsonb, 'open', 'AP1-Q03', null),
('10000000-0000-0000-0000-000000000001', 'AP1-D04', 'DB-Technologie für OEE', null, null, 'open', 'AP1-D03', 'unknown'),
('10000000-0000-0000-0000-000000000001', 'AP1-D05', 'Netzwerk-/Firewall-Freigaben', null, null, 'open', 'IT / Network / Security', 'needs verification'),
('10000000-0000-0000-0000-000000000002', 'AP2-D01', 'Integrationsarchitektur ProMaster', 'Bestehende Strecke wiederverwenden oder separate Integration entwickeln.', '["Reuse SYS-Bench/DASIM/ETL4SYS", "Separate integration"]'::jsonb, 'pending', 'Architecture verification', 'Hypothesis – needs verification')
on conflict (decision_code) do nothing;

insert into public.access_requests (work_package_id, system_name, description, status, responsible, notes) values
('10000000-0000-0000-0000-000000000001', 'iSilon', 'Write access for automated .dat/.raw transfer.', 'required', 'IT / Network / Security', 'Target path unknown.'),
('10000000-0000-0000-0000-000000000001', 'Qlik SQL data source', 'Connection from Qlik to the selected data source.', 'unknown', 'Qlik Owner', 'needs verification'),
('10000000-0000-0000-0000-000000000002', 'ProMaster data', 'Production-suitable data access.', 'unknown', 'Promaster Owner', 'needs verification')
on conflict do nothing;

insert into public.roadmap_items (work_package_id, title, description, week_number, start_date, end_date, status, dependency, sort_order) values
('10000000-0000-0000-0000-000000000001', 'Requirements and target path', null, 35, '2026-08-24', '2026-09-04', 'in_progress', null, 10),
('10000000-0000-0000-0000-000000000001', 'File transfer and Amanda integration', null, 37, '2026-09-07', '2026-10-02', 'planned', 'Target path and conventions', 20),
('10000000-0000-0000-0000-000000000001', 'KDL dashboard and OEE pipeline', null, 41, '2026-10-05', '2026-11-13', 'planned', 'Pipeline and data source decisions', 30),
('10000000-0000-0000-0000-000000000002', 'Discovery and architecture verification', null, 35, '2026-08-24', '2026-10-02', 'planned', 'Owners and access', 10)
on conflict do nothing;

insert into public.activity_log (event_type, work_package_id, entity_type, summary, details, source) values
('project_initialized', null, 'project', 'VM Brake Lab project control initialized', '{"note":"Initial seed data"}'::jsonb, 'codex');

commit;