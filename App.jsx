import React, { useState, useMemo, useEffect } from 'react';
import coursesData from './courses.json';
import Header from './Header.jsx';
import ChatWindow from './ChatWindow.jsx';
import ProgramSelector from './ProgramSelector.jsx';
import FullFlowModal from './FullFlowModal.jsx';
import DataReportModal from './DataReportModal.jsx';
import CourseDetailsModal from './CourseDetailsModal.jsx';
import Toast from './Toast.jsx';

export default function App() {
  // Read initial program from localStorage or default to 'GENERAL'
  const [selectedProgram, setSelectedProgram] = useState(() => {
    return localStorage.getItem('fci_selected_program') || 'GENERAL';
  });

  const [isProgramSelectorOpen, setIsProgramSelectorOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [fullFlowCourse, setFullFlowCourse] = useState(null);
  const [activeModalCourse, setActiveModalCourse] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Save selected program to localStorage
  useEffect(() => {
    localStorage.setItem('fci_selected_program', selectedProgram);
  }, [selectedProgram]);

  // Build O(1) dictionary map of courses by code
  const courseMap = useMemo(() => {
    const map = {};
    coursesData.forEach((course) => {
      map[course.code] = course;
    });
    return map;
  }, []);

  // Show Toast notification
  const handleShowToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Audit stats for modal
  const stats = useMemo(() => {
    const levels = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let totalEdges = 0;

    coursesData.forEach((c) => {
      levels[c.level] = (levels[c.level] || 0) + 1;
      totalEdges += (c.prerequisites || []).length;
    });

    return {
      totalCourses: coursesData.length,
      levels,
      totalEdges,
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white dir-rtl">
      {/* App Header */}
      <Header
        selectedProgram={selectedProgram}
        onOpenProgramSelector={() => setIsProgramSelectorOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        totalCourses={coursesData.length}
      />

      {/* Main Chatbot Window */}
      <main className="flex-1">
        <ChatWindow
          coursesData={coursesData}
          courseMap={courseMap}
          selectedProgram={selectedProgram}
          onOpenProgramSelector={() => setIsProgramSelectorOpen(true)}
          onOpenFullFlow={(course) => setFullFlowCourse(course)}
          onSelectCourse={(course) => setActiveModalCourse(course)}
          onCopy={handleShowToast}
        />
      </main>

      {/* Course Details Modal (Opens on clicking course code/card) */}
      <CourseDetailsModal
        course={activeModalCourse}
        courseMap={courseMap}
        selectedProgram={selectedProgram}
        onClose={() => setActiveModalCourse(null)}
        onSelectCourse={(course) => setActiveModalCourse(course)}
      />

      {/* Program Selector Modal */}
      <ProgramSelector
        isOpen={isProgramSelectorOpen}
        onClose={() => setIsProgramSelectorOpen(false)}
        selectedProgram={selectedProgram}
        onSelectProgram={(progId) => {
          setSelectedProgram(progId);
          handleShowToast(`تم تغيير التخصص إلى [${progId}]`);
        }}
      />

      {/* Full Path Tree Modal */}
      <FullFlowModal
        course={fullFlowCourse}
        courseMap={courseMap}
        selectedProgram={selectedProgram}
        onClose={() => setFullFlowCourse(null)}
        onSelectCourse={(c) => setActiveModalCourse(c)}
      />

      {/* Verification Data Report Modal */}
      <DataReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        stats={stats}
      />

      {/* Non-intrusive Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
