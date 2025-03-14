# Project AI - Minimum Viable Build (MVB)

## Overview

Project AI is a productivity application designed to help users manage their time, tasks, and ideas effectively. The MVB focuses on delivering a streamlined, intuitive interface for daily planning and task management with intelligent time blocking capabilities.

## Core Features

### 1. Daily View Interface

The central component of Project AI is the Daily View, which provides users with:

- **Date Navigation**: Easily move between days with previous/next buttons and a "Today" shortcut
- **Time Block Visualization**: Visual representation of scheduled activities in a 24-hour timeline
- **Task Management**: Create, track, and complete daily tasks
- **Note Taking**: Capture ideas and notes throughout the day

### 2. Time Block Management

The time blocking system is the heart of Project AI, allowing users to:

- **Create Time Blocks**: Schedule activities with specific start and end times
- **Click-to-Create**: Click directly on the timeline to create new time blocks
- **Overlapping Events**: View up to 3 concurrent events side-by-side
- **Visual Differentiation**: Each time block has a unique color based on its title
- **Current Time Indicator**: See the current time marked on today's timeline
- **Edit Time Blocks**: Modify existing time blocks by clicking on them

### 3. Task Management

The task system helps users track what needs to be done:

- **Add Tasks**: Quickly add new tasks to the daily list
- **Complete Tasks**: Mark tasks as complete with a checkbox interface
- **Task Organization**: Tasks are automatically sorted with incomplete tasks at the top
- **Visual Feedback**: Completed tasks are visually distinguished with strikethrough text

### 4. Notes & Ideas

The notes system allows for capturing thoughts and ideas:

- **Add Notes**: Create general notes for reference
- **Add Ideas**: Specifically mark entries as ideas with a lightbulb icon
- **Chronological Display**: View notes in reverse chronological order
- **Timestamp**: Each note includes creation date and time

### 5. Daily Shutdown Process

The shutdown feature encourages good productivity habits:

- **Shutdown Checklist**: Guided end-of-day process with specific checkpoints
- **Daily Reflection**: Space to reflect on the day's accomplishments and challenges
- **Automated Note Creation**: Reflection is saved as a dated note for future reference

## User Interface Elements

### Time Block Display

- **24-hour Timeline**: Visual representation of the entire day
- **Hour/Half-hour Markers**: Clear time demarcation
- **Hover Effects**: Interactive elements highlight on hover
- **Side-by-side Layout**: Overlapping time blocks display in columns (up to 3)
- **Color Coding**: Each time block has a unique color based on its title
- **Current Time Indicator**: Red line showing the current time on today's view

### Navigation & Controls

- **Date Navigation**: Previous/Next day buttons and Today shortcut
- **Fixed Headers**: Main header and section headers remain visible while scrolling
- **Add Buttons**: Quick access to create new items
- **Shutdown Button**: Initiate the end-of-day reflection process

## Technical Implementation

- **React Framework**: Built with React for a responsive, component-based UI
- **State Management**: Centralized store for application data
- **Date Handling**: Comprehensive date and time manipulation
- **Responsive Design**: Adapts to different screen sizes
- **Intelligent Collision Detection**: Algorithm to handle overlapping time blocks
- **Click-to-Create**: Convert pixel coordinates to time values for intuitive scheduling

## User Experience Highlights

- **Intuitive Time Selection**: Click on the timeline to create events at specific times
- **Visual Feedback**: Hover effects and highlighting for interactive elements
- **Streamlined Workflows**: Quick access to common actions
- **Contextual Information**: Time blocks show relevant details based on available space
- **Consistent Visual Language**: Clear design patterns throughout the interface

## Future Enhancements (Post-MVB)

- **Drag and Resize**: Allow time blocks to be dragged and resized directly
- **Recurring Events**: Support for repeating time blocks
- **Calendar Integration**: Sync with external calendar services
- **Mobile Optimization**: Enhanced mobile experience
- **Data Export/Import**: Backup and transfer capabilities
- **Advanced Analytics**: Insights into time usage and productivity patterns

---

This MVB represents the essential feature set required to deliver a valuable productivity tool that helps users effectively manage their time, tasks, and ideas through an intuitive and visually appealing interface. 