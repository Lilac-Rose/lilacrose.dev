const CONFIG = {
    apiKey: 'AIzaSyBtWcSlu-PAU8MTjSpPSZStM8lbuSwaNQA',
    sheetId: '14ChiFwiVvRzHDjyI-u1YcAocVM5b8w3TCu2Yb0VvB0k',
    sheetTabs: [
        { name: 'Home Page', gid: '0', sheetName: 'Home Page' },
        /* { name: 'Pokémon X/Y Shiny Dex', gid: '1143635930', sheetName: 'Pokemon X/Y Shiny Living Dex' */
        //Commented it out because it looks ugly as fuck, might add it back later idk
        { name: 'Celeste Speedrunning', gid: '1819399209', sheetName: 'Celeste Speedrunning' },
        { name: 'Celeste Speedrunning Splits', gid: '1244868216', sheetName: 'Celeste Speedrunning Splits' },
        { name: 'Celeste 202', gid: '1714318174', sheetName: 'Celeste 202' },
        { name: 'Strawberry Jam Max%', gid: '987324777', sheetName: 'Strawberry Jam Max%' },
        { name: 'Hollow Knight', gid: '240945820', sheetName: 'Hollow Knight' },
        { name: 'Terraria', gid: '817420149', sheetName: 'Terraria' },
        { name: 'Minecraft', gid: '1444588187', sheetName: 'Minecraft' },
        { name: 'Potion Craft', gid: '757560082', sheetName: 'Potion Craft: Alchemist Simulator' }
    ],
    refreshInterval: 300000 // 5 minutes
};

//Do you think God is okay with us saying "ohio rizz", cause if not why the FUCK hasnt she done anything about it

class GameTracker {
    constructor() {
        this.currentTabIndex = 0;
        this.initElements();
        this.setupEventListeners();
        this.renderTabs();
        this.loadInitialData();
        this.setupAutoRefresh();
        
        // Load the Google Sheets API
        this.loadGoogleSheetsAPI();
    }

    initElements() {
        this.elements = {
            sheetTabsContainer: document.getElementById('sheet-tabs'),
            tableHeader: document.getElementById('table-header'),
            tableBody: document.getElementById('table-body'),
            syncStatus: document.getElementById('sync-status'),
            lastUpdated: document.getElementById('last-updated'),
            refreshBtn: document.getElementById('refresh-btn'),
            fullscreenBtn: document.getElementById('fullscreen-btn')
        };
    }

    setupEventListeners() {
        this.elements.refreshBtn.addEventListener('click', () => this.refreshData());
        this.elements.fullscreenBtn.addEventListener('click', () => this.openFullView());
    }

    renderTabs() {
        this.elements.sheetTabsContainer.innerHTML = '';
        
        CONFIG.sheetTabs.forEach((tab, index) => {
            const tabElement = document.createElement('button');
            tabElement.className = `sheet-tab ${index === this.currentTabIndex ? 'active' : ''}`;
            tabElement.textContent = tab.name;
            tabElement.addEventListener('click', () => this.switchTab(index));
            this.elements.sheetTabsContainer.appendChild(tabElement);
        });
    }

    switchTab(index) {
        this.currentTabIndex = index;
        document.querySelectorAll('.sheet-tab').forEach(t => t.classList.remove('active'));
        this.elements.sheetTabsContainer.children[index].classList.add('active');
        this.loadSheetData();
    }

    loadInitialData() {
        this.loadSheetData();
    }

    loadGoogleSheetsAPI() {
        // Create script tag for Google Sheets API
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            gapi.load('client', () => {
                gapi.client.init({
                    apiKey: CONFIG.apiKey,
                    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                }).then(() => {
                    console.log('Google Sheets API loaded');
                    this.apiLoaded = true;
                    this.loadSheetData(); // Reload data once API is loaded
                });
            });
        };
        document.body.appendChild(script);
    }

    async loadSheetData() {
        try {
            this.setSyncStatus('SYNC: IN PROGRESS...', 'development');
            
            const currentTab = CONFIG.sheetTabs[this.currentTabIndex];
            
            if (this.apiLoaded) {
                await this.loadDataFromAPI(currentTab);
            } else {
                // Fallback to CSV if API is not yet loaded
                await this.loadDataFromCSV(currentTab);
            }
            
            this.setSyncStatus('SYNC: ACTIVE', 'online');
            this.elements.lastUpdated.innerHTML = `Last sync: ${new Date().toLocaleTimeString()}`;
        } catch (error) {
            console.error('Sync error:', error);
            this.setSyncStatus('SYNC: ERROR', 'offline');
            this.elements.lastUpdated.innerHTML = 'Last sync: <span class="error">FAILED</span>';
            this.showFallbackOption();
        }
    }

    async loadDataFromAPI(currentTab) {
        // Get sheet metadata to find hidden columns and rows
        const metadataResponse = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: CONFIG.sheetId,
            includeGridData: true,
            ranges: [currentTab.sheetName]
        });
        
        // Extract sheet data and metadata
        const sheet = metadataResponse.result.sheets[0];
        const gridProperties = sheet.properties.gridProperties;
        const sheetData = sheet.data[0];
        
        // Get hidden columns information
        const hiddenColumns = new Set();
        if (sheetData.columnMetadata) {
            sheetData.columnMetadata.forEach((colMeta, index) => {
                if (colMeta.hiddenByUser) {
                    hiddenColumns.add(index);
                }
            });
        }
        
        // Get hidden rows information
        const hiddenRows = new Set();
        if (sheetData.rowMetadata) {
            sheetData.rowMetadata.forEach((rowMeta, index) => {
                if (rowMeta.hiddenByUser) {
                    hiddenRows.add(index);
                }
            });
        }
        
        // Get cell values
        const dataResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.sheetId,
            range: currentTab.sheetName
        });
        
        const rows = dataResponse.result.values || [];
        
        // Render table with hidden rows and columns information
        this.renderTable(rows, hiddenRows, hiddenColumns);
    }

    async loadDataFromCSV(currentTab) {
        // Fallback to CSV method
        const visualizationUrl = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/gviz/tq?gid=${currentTab.gid}&tqx=out:csv`;
        
        const response = await fetch(visualizationUrl);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const csvData = await response.text();
        const rows = this.parseCSV(csvData);
        
        // Without API, we can't detect hidden rows/columns, so pass empty Sets
        this.renderTable(rows, new Set(), new Set());
    }

    parseCSV(csv) {
        // Remove Google's visualization API wrapper if present
        if (csv.startsWith('/*O_o*/')) {
            csv = csv.split('\n').slice(1).join('\n');
        }
        
        const rows = csv.split('\n');
        return rows.map(row => {
            const values = [];
            let inQuotes = false;
            let currentValue = '';
            
            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(currentValue);
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            
            values.push(currentValue);
            return values;
        });
    }

    isHiddenColumn(index, hiddenColumns) {
        return hiddenColumns.has(index);
    }

    isHiddenRow(index, hiddenRows) {
        return hiddenRows.has(index);
    }

    isEmptyRow(row) {
        return !row || row.every(cell => !cell || cell.trim() === '');
    }

    formatCellContent(content) {
        // Replace TRUE/FALSE values with Unicode check marks
        if (content === 'TRUE') {
            return '✓';
        } else if (content === 'FALSE') {
            return '✗';
        }
        return content;
    }

    getCellClassName(content) {
        // Add classes for TRUE/FALSE values
        if (content === 'TRUE') {
            return 'cell-true';
        } else if (content === 'FALSE') {
            return 'cell-false';
        }
        return '';
    }

    renderTable(rows, hiddenRows, hiddenColumns) {
        if (!rows || rows.length === 0) {
            this.elements.tableHeader.innerHTML = '<th>NO DATA AVAILABLE</th>';
            this.elements.tableBody.innerHTML = '<tr><td>Ensure your sheet is properly shared and contains data</td></tr>';
            return;
        }
    
        this.elements.tableHeader.innerHTML = '';
        this.elements.tableBody.innerHTML = '';
    
        // Find the maximum column count to ensure we account for all potential columns
        const maxColumns = Math.max(...rows.map(row => row ? row.length : 0));
    
        // Create header row
        for (let i = 0; i < maxColumns; i++) {
            // Skip if column is explicitly hidden
            if (this.isHiddenColumn(i, hiddenColumns)) {
                continue;
            }
    
            const th = document.createElement('th');
            th.textContent = (rows[0] && rows[0][i]) || '';
            this.elements.tableHeader.appendChild(th);
        }
    
        // Create data rows
        for (let i = 1; i < rows.length; i++) {
            // Skip if row is explicitly hidden via right-click in Sheets
            if (this.isHiddenRow(i, hiddenRows)) {
                continue;
            }
    
            const tr = document.createElement('tr');
    
            // If this row is completely empty, add it as a spacer row
            if (this.isEmptyRow(rows[i])) {
                const spacerTd = document.createElement('td');
                spacerTd.colSpan = maxColumns;
                spacerTd.style.height = '1.5rem';
                tr.appendChild(spacerTd);
                tr.classList.add('spacer-row');
            } else {
                // Normal row with data
                for (let j = 0; j < maxColumns; j++) {
                    // Skip if column is explicitly hidden
                    if (this.isHiddenColumn(j, hiddenColumns)) {
                        continue;
                    }
    
                    const td = document.createElement('td');
                    
                    // Check if this cell exists in the row data
                    const cellContent = (rows[i] && rows[i][j]) || '';
    
                    // Apply special styling for status columns
                    if (rows[0] && rows[0][j] && rows[0][j].toLowerCase().includes('status')) {
                        td.className = `status-${cellContent.toLowerCase().replace(/\s+/g, '')}`;
                    }
    
                    // Apply special formatting for TRUE/FALSE values
                    const formattedContent = this.formatCellContent(cellContent);
                    const className = this.getCellClassName(cellContent);
    
                    if (className) {
                        td.classList.add(className);
                    }
    
                    td.textContent = formattedContent || '';
    
                    // Add spacer class if cell is empty
                    if (!cellContent || cellContent.trim() === '') {
                        td.classList.add('spacer-cell');
                    }
    
                    tr.appendChild(td);
                }
            }
    
            this.elements.tableBody.appendChild(tr);
        }
    }

    showFallbackOption() {
        const currentTab = CONFIG.sheetTabs[this.currentTabIndex];
        const directLink = `https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/edit#gid=${currentTab.gid}`;
        
        this.elements.tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="error-message">
                    >_DIRECT ACCESS REQUIRED<br>
                    <a href="${directLink}" target="_blank" class="terminal-btn">[OPEN IN GOOGLE SHEETS]</a>
                    <button class="terminal-btn" id="try-iframe">[TRY EMBEDDED VIEW]</button>
                </td>
            </tr>
        `;
        
        document.getElementById('try-iframe').addEventListener('click', () => this.openFullView());
    }

    openFullView() {
        const currentTab = CONFIG.sheetTabs[this.currentTabIndex];
        const iframeUrl = `https://docs.google.com/spreadsheets/d/e/${CONFIG.sheetId}/pubhtml?gid=${currentTab.gid}&single=true&widget=false&headers=false&chrome=false`;
        
        this.elements.tableBody.innerHTML = `
            <tr>
                <td colspan="10">
                    <iframe src="${iframeUrl}" class="sheet-iframe"></iframe>
                </td>
            </tr>
        `;
    }

    refreshData() {
        this.loadSheetData();
    }

    setSyncStatus(text, status) {
        this.elements.syncStatus.textContent = text;
        this.elements.syncStatus.className = `status-indicator ${status}`;
    }

    setupAutoRefresh() {
        setInterval(() => this.refreshData(), CONFIG.refreshInterval);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new GameTracker());