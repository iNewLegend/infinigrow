
By following the [Design file](https://www.figma.com/file/qF0tWg1XosRL88bEzpqenp/R%26D-%7C-Candidate-Assignment?node-id=708%3A190) and the specs,

- Re-create the screens
    - The screens represent the different statuses of the "Budget Allocation" option.
    - Depending on the option you choose, the behavior of allocating the budget should change.
- Integrate the logic behind each part (defined in the spec).

### Specs

**Tabs**

- **Clicking on each tab will navigate us between tabs pages.**

**Both tabs**

- **Add channel button (****bonus****)**
    - Will add a new row, with a new channel. The channel icon can be ignored and the channel name will be inserted by the user.

**First tab-**

**Rows**

- **Rows Behavior**
    - Collapse / Expand
        - Rows should be closed by default.
        - Clicking on a row will open it and the channel data will be saved automatically.
        - Only one row can be expanded at a time (expanding a new row or adding a new row will collapse the previous one).
        - The arrow at the left side of the row should turn accordingly.

- **3 dots**
    - Edit - will enable to edit channel name. (editing channel data is by clicking and expending the channel row)
    - Remove - will remove the entire channel.


**Expediting a channel section -**

**Budget**

- **Budget frequency**
    - Dropdown
        - Annually - will divide the budget into 12.
        - Monthly - will assign the budget to each month.
        - Quarterly - will assign the budget to each quarter.

- **Baseline {frequency} Budget**
    - Title - frequency should be dynamic according to the chosen budget frequency.
    - Add a decimal separator (eg 100 / 1,000 / 10,000).

- **Budget Allocation rules**
    - **Equal**
        - Budget Breakdown fields should be disabled.
        - Adding an amount to "Baseline budget", should fill the "Budget Breakdown" fields and be divided equally.
        - The "Baseline budget" font color should be #2A3558
        - The "Budget Breakdown" font color should be #99A4C2

    - **Manual**
        - "Budget Breakdown" fields should be enabled.
        - The "Baseline budget" should be disabled.
        - The "Baseline budget" should become the sum of all the "Budget Breakdown" fields.
        - The "Baseline budget" font color should be #99A4C2
        - The "Budget Breakdown" font color should be #2A3558

**Second tab-**

Here you have 2 ways to implement the tab.

First one -

- Table view of all channels budget according to month. This option includes only a view of the data, without any functionalities.

Second one - (the bonus one)

- **First table row**
    - Current year monthly view.

- **Channel row**
    - Budget edit - near each budget, edit icon will be displayed on hover and when clicking, it will open the option to edit a specific month budget, with 2 new icons - X and V.
    - V - will save the new budget.
    - X - will cancel the new budget.
