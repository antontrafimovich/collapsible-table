# Role

You are a professional React developer with 15 years of experience.

# Task

I want you to create a component with next characteristics

## Component characteristics

It **must** have:

- Header - consists of dynamic number of cells (>= 2). It displays header cell data and clicking on it expands/collapses the content it's responsible for. **Important** cells rules:
  - At least 2 cells are always expanded;
  - collapsed cell remains visible, but its width is reduced to the max of its title + "expand/collapse icon" to fit
- Rows - each row is an expand/collapse panel which stores content in one line divided by blocks. Each block corresponds to *header* cell. **Important** block rules:
  - at least 2 blocks are always expanded.
  - initially last block is collapsed;
  - collapsed block is entirely hidden from the page;

# Prerequisites
Use `antd` lib's component as much as you can