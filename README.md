# Personal Portfolio - Akshay Vishnu

Assignment 1, Full Stack Development. Plain HTML5 and CSS3

## Design rationale

The palette runs from cobalt to navy over a pale blue gradient. I wanted
something that reads as a technical site but stays light enough that the long
project descriptions are comfortable to read, so the content sits on 
white cards over a soft gradient. Every colour and both spacing values are
declared once in `:root` so changing the accent is a one-line edit.

The page opens on a full-width banner. The quote runs across the middle of the
image rather than sitting in a corner and the name and tagline sit below the
photo so the two never compete. After that the page is a straight vertical
read: education, experience, projects, achievements, skills, extracurriculars,
contact.

## Layout technique

CSS Grid handles the parts needing alignment in two directions. Projects is a
two-column grid so cards line up across rows as well as down columns, and the
skills list works the same way.

Flexbox handles the single rows: the header, where brand and nav sit at opposite
ends; the nav list; the buttons; and the social links. Those only need to sit on
one line and wrap when space runs out.

Two breakpoints. At 768px both grids drop to one column and the header stacks.
At 480px the buttons stack and the quote shrinks.

## Known limitations
- validation of form by javascript is to be done in the future .
