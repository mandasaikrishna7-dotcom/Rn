# Requirements Document

## Introduction

Add a downloadable PDF notes feature to the existing NextSelf agentic-ai-curator platform. This feature allows users to create, manage, and export their curated content reflections as well-formatted PDF documents that serve as study materials and personal knowledge artifacts.

## Glossary

- **Note**: User-authored or agent-assisted textual content tied to curated resources
- **PDF_Export**: Backend-rendered HTML-to-PDF conversion producing formatted documents
- **Linked_Resource**: A curated item from the existing feed that a note references
- **Journey_Context**: The user's stated goals and identity evolution tracked in the existing journey system
- **Agent_Summary**: AI-generated structured summary of a curated item that users can edit and save
- **Flashcard_Set**: Question-answer pairs extracted from notes for spaced repetition learning
- **Export_Scope**: User-defined filtering for which notes to include in PDF export

## Requirements

### Requirement 1: Notes Data Model and Storage

**User Story:** As a NextSelf user, I want to create and store notes about curated items, so that I can build my personal knowledge repository.

#### Acceptance Criteria

1. THE Notes_Storage SHALL store notes with id, title, linked_item_ids array, content, tags array, timestamps, and source_type
2. WHEN a note is created, THE System SHALL assign a unique identifier and current timestamp
3. THE System SHALL support source_type values of "manual", "agent_summary", and "highlight_extract"
4. WHEN content is saved, THE System SHALL preserve rich text formatting through markdown storage
5. THE System SHALL maintain referential links between notes and existing curated items by ID

### Requirement 2: Note Creation and Management Interface

**User Story:** As a user, I want intuitive ways to create notes from curated content, so that I can capture insights without friction.

#### Acceptance Criteria

1. WHEN viewing an item detail page, THE System SHALL provide "Add Note", "Summarize for me", and "Highlight" action buttons
2. THE Notes_List_View SHALL display all notes with filtering by tag, linked item, and date range
3. THE System SHALL support multi-selection of notes for bundled operations
4. WHEN editing a note, THE System SHALL provide rich text editing capabilities through markdown
5. THE Tag_System SHALL allow users to organize notes with custom labels

### Requirement 3: Agent-Assisted Note Generation

**User Story:** As a user, I want AI assistance in creating structured summaries of curated items, so that I can quickly capture key insights.

#### Acceptance Criteria

1. WHEN "Summarize for me" is triggered, THE Agent_Summarizer SHALL generate a structured summary of the curated item
2. THE Generated_Summary SHALL be editable by the user before saving as a note
3. THE System SHALL mark agent-generated content with source_type "agent_summary"
4. THE Agent_Summarizer SHALL extract key themes, main arguments, and actionable insights
5. WHEN the backend lacks LLM access, THE System SHALL display a clear "feature requires AI backend" message

### Requirement 4: PDF Export with Professional Formatting

**User Story:** As a user, I want to export my notes as well-formatted PDFs, so that I can study offline and share my knowledge artifacts.

#### Acceptance Criteria

1. THE PDF_Export SHALL generate documents using backend HTML-to-PDF rendering for proper typography
2. THE Export_Document SHALL include a styled cover page matching the app's journal aesthetic
3. THE Export_Document SHALL contain an auto-generated table of contents with page numbers
4. THE Export_Document SHALL format each note as a distinct section with title, tags, linked sources, and content
5. THE Export_Document SHALL include a consolidated source citation appendix
6. THE Export_Document SHALL add page numbers and QR codes linking back to in-app content
7. THE Export_Scope_Selector SHALL offer single note, tagged collection, and date range export options

### Requirement 5: Auto-Generated Flashcard Extraction

**User Story:** As a user, I want flashcards automatically generated from my notes, so that I can use spaced repetition for better retention.

#### Acceptance Criteria

1. WHEN notes are exported or on-demand, THE Flashcard_Generator SHALL extract key claims and definitions
2. THE Flashcard_Generator SHALL create question-answer pairs suitable for spaced repetition
3. THE Flashcard_Set SHALL be reviewable within the app interface
4. THE System SHALL identify factual statements, definitions, and key concepts for flashcard creation
5. WHEN the backend lacks LLM access, THE System SHALL clearly indicate this feature is unavailable

### Requirement 6: Journey-Linked Context Integration

**User Story:** As a user, I want my exported PDFs to reflect my growth journey context, so that I can see how my learning aligned with my evolving goals.

#### Acceptance Criteria

1. THE PDF_Cover_Page SHALL display the user's stated goal from the Journey system at the time notes were created
2. THE Export_System SHALL preserve historical context showing "what I was working toward then vs now"
3. THE Journey_Integration SHALL pull goal statements from the existing user profile and journey timeline
4. THE Context_Display SHALL help users understand their past learning in relation to identity evolution
5. THE System SHALL gracefully handle cases where journey context is unavailable

### Requirement 7: Voice-to-Note Capture

**User Story:** As a user, I want to quickly capture spoken reflections after engaging with content, so that I can record immediate insights.

#### Acceptance Criteria

1. THE Voice_Capture SHALL use Web Speech API for frontend audio-to-text conversion
2. WHEN "speak your note" is activated, THE System SHALL provide clear recording feedback
3. THE Transcribed_Text SHALL be editable before saving as a note
4. THE Voice_Note SHALL be automatically linked to the currently viewed curated item
5. THE System SHALL handle browser compatibility limitations gracefully with fallback messaging

### Requirement 8: Smart Bundling for Study Sessions

**User Story:** As a user, I want to bundle notes by target dates and topics, so that I can create focused study materials for exams or deadlines.

#### Acceptance Criteria

1. THE Tag_System SHALL support target date tagging for deadline-based organization
2. THE Smart_Bundler SHALL generate combined PDFs for all notes tagged to specific dates
3. THE Bundle_Export SHALL organize content chronologically and thematically within target date groups
4. THE System SHALL provide batch operations for applying target date tags to multiple notes
5. THE Bundled_PDF SHALL maintain individual note attribution while creating cohesive study documents

### Requirement 9: Backend Integration and API Endpoints

**User Story:** As a developer, I want robust backend support for notes functionality, so that the feature integrates seamlessly with existing NextSelf architecture.

#### Acceptance Criteria

1. THE Backend SHALL provide CRUD endpoints for notes with proper validation
2. THE PDF_Generator SHALL use WeasyPrint or ReportLab for server-side HTML-to-PDF conversion
3. THE API SHALL support bulk export requests with scope filtering parameters
4. THE Backend SHALL integrate with existing state management and user authentication
5. THE Export_Service SHALL handle large document generation without blocking other requests

### Requirement 10: Navigation and User Experience Integration

**User Story:** As a user, I want notes functionality to feel native to the NextSelf interface, so that it enhances rather than disrupts my existing workflow.

#### Acceptance Criteria

1. THE Navigation SHALL include a "Notes" section following the existing UI patterns
2. THE Notes_UI SHALL match the neo-brutalist design system with hard edges and ink borders
3. THE Export_Modal SHALL provide clear scope selection with the established button and card styles
4. THE System SHALL maintain responsive design supporting both desktop and mobile usage
5. THE Notes_Section SHALL integrate smoothly with existing Journey, Progress, and Settings navigation