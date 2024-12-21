<script>
    import { onMount } from "svelte";
    import { writable, derived } from "svelte/store";

    // Create a writable store for students data
    let students = writable([]);

    // Create writable stores for filter and sort state
    let branchFilter = writable("all");
    let collegeFilter = writable("all");
    let sortKey = writable("");
    let sortDirection = writable("ascending");

    // Load student data from JSON file
    onMount(async () => {
        const response = await fetch("/data.json"); // Assuming the file is placed in /static
        if (response.ok) {
            const data = await response.json();
            students.set(data); // Set the students data in the store
        } else {
            console.error("Failed to fetch student data.");
        }
    });

    // Derived stores for unique branches and colleges
    let branches = derived(students, ($students) => [
        ...new Set($students.map((student) => student.branch)),
    ]);

    let colleges = derived(students, ($students) => [
        ...new Set($students.map((student) => student.college)),
    ]);

    // Define the table headers and corresponding keys
    const headers = [
        { label: "Name", key: "name" },
        { label: "College", key: "college" },
        { label: "Roll Number", key: "roll" },
        { label: "Branch", key: "branch" },
        { label: "Marks", key: "marks" },
        { label: "Theory Marks", key: "theory" },
        { label: "Remarks", key: "remarks" },
    ];

    // Sorting function
    function handleSort(key) {
        sortKey.update(($sortKey) => {
            if ($sortKey === key) {
                // Toggle sorting direction if the same key is clicked
                sortDirection.update(($sortDirection) =>
                    $sortDirection === "ascending" ? "descending" : "ascending",
                );
            } else {
                sortDirection.set("ascending");
                return key;
            }
            return $sortKey;
        });
    }

    // Derived store for filtered and sorted students
    let filteredAndSortedStudents = derived(
        [students, branchFilter, collegeFilter, sortKey, sortDirection],
        ([
            $students,
            $branchFilter,
            $collegeFilter,
            $sortKey,
            $sortDirection,
        ]) => {
            return $students
                .filter(
                    (student) =>
                        $branchFilter === "all" ||
                        student.branch === $branchFilter,
                )
                .filter(
                    (student) =>
                        $collegeFilter === "all" ||
                        student.college === $collegeFilter,
                )
                .sort((a, b) => {
                    if (!$sortKey) return 0;

                    const aVal = a[$sortKey];
                    const bVal = b[$sortKey];

                    if (typeof aVal === "string") {
                        return $sortDirection === "ascending"
                            ? aVal.localeCompare(bVal)
                            : bVal.localeCompare(aVal);
                    } else {
                        return $sortDirection === "ascending"
                            ? aVal - bVal
                            : bVal - aVal;
                    }
                });
        },
    );
</script>

<h2>Student Records</h2>

<!-- Filters -->
<select bind:value={$branchFilter}>
    <option value="all">All Branches</option>
    {#each $branches as branch}
        <option value={branch}>{branch}</option>
    {/each}
</select>

<select bind:value={$collegeFilter}>
    <option value="all">All Colleges</option>
    {#each $colleges as college}
        <option value={college}>{college}</option>
    {/each}
</select>

<!-- Table -->
<table>
    <thead>
        <tr>
            {#each headers as { label, key }}
                <th>
                    <button onclick={() => handleSort(key)}>
                        {label}
                        {#if $sortKey === key}
                            <span
                                >{$sortDirection === "ascending"
                                    ? "↑"
                                    : "↓"}</span
                            >
                        {/if}
                    </button>
                </th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each $filteredAndSortedStudents as student}
            <tr>
                {#each headers as { key }}
                    <td>{student[key]}</td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    th,
    td {
        padding: 12px 20px;
        text-align: left;
        border: 1px solid #ddd;
    }

    th {
        background-color: #4caf50;
        color: white;
        font-weight: bold;
        text-transform: uppercase;
        cursor: pointer;
    }

    th button {
        background: none;
        border: none;
        color: white;
        font-size: 14px;
        font-weight: bold;
        text-align: left;
        width: 100%;
        padding: 10px;
        cursor: pointer;
    }

    th button:hover {
        background-color: #45a049;
    }

    tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    tr:hover {
        background-color: #ddd;
    }

    td {
        color: #333;
        font-size: 14px;
        white-space: nowrap;
    }

    td,
    th {
        text-align: center;
    }

    select {
        padding: 8px 12px;
        margin: 10px 0;
        border-radius: 4px;
        border: 1px solid #ddd;
        font-size: 14px;
    }

    select:focus {
        outline: none;
        border-color: #4caf50;
    }

    button span {
        margin-left: 5px;
        font-size: 12px;
        font-weight: normal;
    }

    /* .filters {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
    }

    .filters select {
        width: 48%;
    } */
</style>
