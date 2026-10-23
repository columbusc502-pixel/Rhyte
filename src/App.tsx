import React, { useState, useEffect, useRef } from 'react';
import { LyricLine, LyricSection, ProjectSnapshot, SongProject, UserSettings } from './types/lyric';
import { SONG_TEMPLATES } from './utils/templates';
import { analyzeLine, calculateSongMetrics, processSectionRhymesAndCadence } from './utils/phonetics';
import { Header } from './components/Header';
import { SidebarSections } from './components/SidebarSections';
import { LyricEditor } from './components/LyricEditor';
import { RhymeInspector } from './components/RhymeInspector';
import { FlowRadar } from './components/FlowRadar';
import { FreestyleMode } from './components/FreestyleMode';
import { SmartAssistantModal } from './components/SmartAssistantModal';
import { IdeaLockerModal } from './components/IdeaLockerModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { ExportModal } from './components/ExportModal';
import { ProjectsModal } from './components/ProjectsModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { InstallAppModal } from './components/InstallAppModal';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  fontSize: 16,
  fontFamily: 'sans',
  colorblindMode: false,
  highlightMode: 'all',
  metronomeVolume: 0.7,
  autoScroll: true,
  syllableTolerance: 3,
};

export default function App() {
  // Load initial projects from localStorage or default template
  const [projects, setProjects] = useState<SongProject[]>(() => {
    try {
      const saved = localStorage.getItem('rhyte_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved projects', e);
    }
    return [SONG_TEMPLATES[0].template];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    return projects[0]?.id || SONG_TEMPLATES[0].template.id;
  });

  const currentProject =
    projects.find((p) => p.id === currentProjectId) || projects[0] || SONG_TEMPLATES[0].template;

  const [activeSectionId, setActiveSectionId] = useState<string>(() => {
    return currentProject.sections[0]?.id || '';
  });

  // Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('rhyte_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // View Mode: 'write' (Studio) | 'flow' (Cadence Lab) | 'freestyle'
  const [activeMode, setActiveMode] = useState<'write' | 'flow' | 'freestyle'>('write');

  // Active word selection for Rhyme Inspector
  const [selectedWord, setSelectedWord] = useState<string | null>('night');
  const [activeLineContext, setActiveLineContext] = useState<{
    lineText: string;
    lineId: string;
  } | null>(null);

  // Snapshots for version history
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('rhyte_snapshots');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: `snap_${Date.now()}`,
        timestamp: Date.now(),
        label: 'Initial Take',
        project: currentProject,
      },
    ];
  });

  // Modals visibility
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [showIdeaLockerModal, setShowIdeaLockerModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInstallAppModal, setShowInstallAppModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(() => {
    return !localStorage.getItem('rhyte_onboarding_completed');
  });

  // Undo / Redo history buffer for current project
  const undoStack = useRef<SongProject[]>([]);
  const redoStack = useRef<SongProject[]>([]);

  // Apply theme class to <html> element
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [settings.theme]);

  // Persist projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rhyte_projects', JSON.stringify(projects));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [projects]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('rhyte_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Persist snapshots
  useEffect(() => {
    try {
      localStorage.setItem('rhyte_snapshots', JSON.stringify(snapshots));
    } catch (e) {}
  }, [snapshots]);

  // Ensure activeSectionId is always valid
  useEffect(() => {
    if (
      !currentProject.sections.some((s) => s.id === activeSectionId) &&
      currentProject.sections.length > 0
    ) {
      setActiveSectionId(currentProject.sections[0].id);
    }
  }, [currentProjectId, currentProject.sections]);

  // Auto-snapshotting every 5 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      createSnapshot('Auto-save checkpoint');
    }, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [currentProject]);

  // Helper to create snapshot
  const createSnapshot = (label = 'Draft take') => {
    const snap: ProjectSnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      label,
      project: currentProject,
    };
    setSnapshots((prev) => [snap, ...prev.slice(0, 19)]); // keep last 20 snapshots
  };

  // Update project helper with undo support
  const handleUpdateProject = (updatedFields: Partial<SongProject>) => {
    undoStack.current.push(currentProject);
    if (undoStack.current.length > 30) undoStack.current.shift();
    redoStack.current = [];

    const updatedProject = {
      ...currentProject,
      ...updatedFields,
      updatedAt: Date.now(),
    };

    setProjects((prev) => prev.map((p) => (p.id === currentProjectId ? updatedProject : p)));
  };

  // Update sections for current project
  const handleUpdateSections = (sections: LyricSection[]) => {
    handleUpdateProject({ sections });
  };

  // Handle word selection from lyric lines
  const handleSelectWord = (word: string, lineId: string, tokenIndex: number) => {
    setSelectedWord(word);
    const line = currentProject.sections
      .flatMap((s) => s.lines)
      .find((l) => l.id === lineId);
    if (line) {
      setActiveLineContext({ lineText: line.rawText, lineId });
    }
  };

  // Insert word into current active line or append
  const handleInsertWordFromRhymes = (wordToInsert: string) => {
    if (!activeLineContext?.lineId) return;

    const updatedSections = currentProject.sections.map((sec) => {
      const lineIdx = sec.lines.findIndex((l) => l.id === activeLineContext.lineId);
      if (lineIdx === -1) return sec;

      const line = sec.lines[lineIdx];
      const newText = line.rawText ? `${line.rawText} ${wordToInsert}` : wordToInsert;
      const updatedLines = [...sec.lines];
      updatedLines[lineIdx] = analyzeLine(newText, line.id);

      return processSectionRhymesAndCadence({ ...sec, lines: updatedLines });
    });

    handleUpdateSections(updatedSections);
  };

  // Apply full line suggestion from AI Copilot
  const handleApplySuggestedLine = (newLineText: string) => {
    const updatedSections = currentProject.sections.map((sec) => {
      if (sec.id !== activeSectionId) return sec;

      const newLines = [...sec.lines];
      if (activeLineContext?.lineId) {
        const lineIdx = newLines.findIndex((l) => l.id === activeLineContext.lineId);
        if (lineIdx !== -1) {
          newLines[lineIdx] = analyzeLine(newLineText, activeLineContext.lineId);
          return processSectionRhymesAndCadence({ ...sec, lines: newLines });
        }
      }

      // If no specific line targeted, append to end of active section
      newLines.push(analyzeLine(newLineText, `line_${Date.now()}`));
      return processSectionRhymesAndCadence({ ...sec, lines: newLines });
    });

    handleUpdateSections(updatedSections);
  };

  // Toggle favorite line in Punchline Locker
  const handleToggleFavoriteLine = (lineText: string) => {
    const currentFavs = currentProject.favoriteLines || [];
    const exists = currentFavs.includes(lineText);
    const updated = exists ? currentFavs.filter((l) => l !== lineText) : [lineText, ...currentFavs];
    handleUpdateProject({ favoriteLines: updated });
  };

  // Add line to project from Freestyle mode
  const handleAddLineFromFreestyle = (lineText: string) => {
    const updatedSections = currentProject.sections.map((sec) => {
      if (sec.id !== activeSectionId) return sec;
      const newLines = [...sec.lines, analyzeLine(lineText, `line_${Date.now()}`)];
      return processSectionRhymesAndCadence({ ...sec, lines: newLines });
    });
    handleUpdateSections(updatedSections);
  };

  // Create new blank song project
  const handleCreateNewProject = () => {
    const newProject: SongProject = {
      id: `proj_${Date.now()}`,
      title: 'Untitled Track',
      bpm: 90,
      keySignature: 'C',
      genre: 'Hip-Hop',
      mood: 'Focused',
      tags: ['New Draft'],
      sections: [
        processSectionRhymesAndCadence({
          id: `sec_${Date.now()}_0`,
          name: 'Verse 1',
          type: 'verse',
          positionIndex: 0,
          targetBars: 16,
          lines: [
            analyzeLine('', `line_${Date.now()}_0`),
            analyzeLine('', `line_${Date.now()}_1`),
            analyzeLine('', `line_${Date.now()}_2`),
            analyzeLine('', `line_${Date.now()}_3`),
          ],
        }),
      ],
      notes: '',
      favoriteLines: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setProjects((prev) => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);
    setActiveSectionId(newProject.sections[0].id);
  };

  // Load a genre template
  const handleLoadTemplate = (template: SongProject) => {
    const freshInstance: SongProject = {
      ...template,
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setProjects((prev) => [freshInstance, ...prev]);
    setCurrentProjectId(freshInstance.id);
    setActiveSectionId(freshInstance.sections[0].id);
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) return;
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (currentProjectId === id) {
      setCurrentProjectId(remaining[0].id);
      setActiveSectionId(remaining[0].sections[0]?.id || '');
    }
  };

  // Restore snapshot
  const handleRestoreSnapshot = (snap: ProjectSnapshot) => {
    handleUpdateProject(snap.project);
  };

  // Overall metrics for header and sidebar
  const songMetrics = calculateSongMetrics(currentProject.sections);

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#0a0b0e] text-[#ededf0] selection:bg-cyan-500/30 selection:text-cyan-200 ${
        settings.theme === 'light' ? 'light' : 'dark'
      }`}
    >
      {/* App Header */}
      <Header
        project={currentProject}
        onUpdateProject={handleUpdateProject}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        settings={settings}
        onUpdateSettings={(up) => setSettings((s) => ({ ...s, ...up }))}
        onOpenAssistant={() => setShowAssistantModal(true)}
        onOpenIdeaLocker={() => setShowIdeaLockerModal(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenProjects={() => setShowProjectsModal(true)}
        onNewProject={handleCreateNewProject}
        onOpenInstallApp={() => setShowInstallAppModal(true)}
      />

      {/* Main Studio Body */}
      {activeMode === 'freestyle' ? (
        <FreestyleMode
          project={currentProject}
          onClose={() => setActiveMode('write')}
          onAddLineToProject={handleAddLineFromFreestyle}
        />
      ) : activeMode === 'flow' ? (
        <div className="flex-1 flex overflow-hidden">
          <SidebarSections
            project={currentProject}
            activeSectionId={activeSectionId}
            onSelectSection={setActiveSectionId}
            onUpdateSections={handleUpdateSections}
            rhymeDensity={songMetrics.rhymeDensity}
          />
          <FlowRadar project={currentProject} activeSectionId={activeSectionId} />
        </div>
      ) : (
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Left: Song Structure & Sections */}
          <SidebarSections
            project={currentProject}
            activeSectionId={activeSectionId}
            onSelectSection={setActiveSectionId}
            onUpdateSections={handleUpdateSections}
            rhymeDensity={songMetrics.rhymeDensity}
          />

          {/* Center: Main Lyric Editor */}
          <LyricEditor
            project={currentProject}
            activeSectionId={activeSectionId}
            onUpdateSections={handleUpdateSections}
            onSelectWord={handleSelectWord}
            selectedWord={selectedWord}
            onOpenAssistantForLine={(text, id) => {
              setActiveLineContext({ lineText: text, lineId: id });
              setShowAssistantModal(true);
            }}
            onToggleFavoriteLine={handleToggleFavoriteLine}
            settings={settings}
          />

          {/* Right: Rhyme Dictionary & Word Inspector */}
          <RhymeInspector
            selectedWord={selectedWord}
            onSelectWord={setSelectedWord}
            onInsertWord={handleInsertWordFromRhymes}
            onAddToFavorites={handleToggleFavoriteLine}
          />
        </main>
      )}

      {/* Modals */}
      {showProjectsModal && (
        <ProjectsModal
          currentProjectId={currentProjectId}
          projects={projects}
          onSelectProject={setCurrentProjectId}
          onCreateNewProject={handleCreateNewProject}
          onLoadTemplate={handleLoadTemplate}
          onDeleteProject={handleDeleteProject}
          onClose={() => setShowProjectsModal(false)}
        />
      )}

      {showAssistantModal && (
        <SmartAssistantModal
          project={currentProject}
          activeLineText={activeLineContext?.lineText || ''}
          activeLineId={activeLineContext?.lineId}
          onClose={() => setShowAssistantModal(false)}
          onApplyLine={handleApplySuggestedLine}
        />
      )}

      {showIdeaLockerModal && (
        <IdeaLockerModal
          project={currentProject}
          onUpdateProject={handleUpdateProject}
          onInsertLine={handleApplySuggestedLine}
          onClose={() => setShowIdeaLockerModal(false)}
        />
      )}

      {showHistoryModal && (
        <VersionHistoryModal
          currentProject={currentProject}
          snapshots={snapshots}
          onCreateSnapshot={(lbl) => createSnapshot(lbl)}
          onRestoreSnapshot={handleRestoreSnapshot}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal project={currentProject} onClose={() => setShowExportModal(false)} />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(up) => setSettings((s) => ({ ...s, ...up }))}
          onClose={() => setShowSettingsModal(false)}
          onOpenInstallApp={() => setShowInstallAppModal(true)}
        />
      )}

      {showInstallAppModal && (
        <InstallAppModal onClose={() => setShowInstallAppModal(false)} />
      )}

      {showOnboardingModal && (
        <OnboardingModal
          onClose={() => {
            setShowOnboardingModal(false);
            localStorage.setItem('rhyte_onboarding_completed', 'true');
          }}
        />
      )}
    </div>
  );
}
