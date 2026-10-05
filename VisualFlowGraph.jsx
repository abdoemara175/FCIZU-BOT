import React from 'react';
import FlowVisualization from './FlowVisualization.jsx';

export default function VisualFlowGraph({ course, courseMap, selectedProgram = 'GENERAL', onSelectCourse }) {
  if (!course) return null;

  return (
    <FlowVisualization
      currentCourse={course}
      courseMap={courseMap}
      selectedProgram={selectedProgram}
      onSelectCourse={onSelectCourse}
    />
  );
}
