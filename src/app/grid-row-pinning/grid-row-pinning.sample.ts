import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import {
    IgxGridComponent,
    ColumnPinningPosition,
    RowPinningPosition, IgxGridRowComponent,
    IgxTransactionService,
    IgxGridTransaction,
    IgxGridStateDirective,
    IgxExcelExporterService,
    IgxExcelExporterOptions,
    DisplayDensityToken,
    DisplayDensity,
    IgxHierarchicalGridComponent,
    IDisplayDensityOptions
} from 'igniteui-angular';
import { IPinningConfig } from 'projects/igniteui-angular/src/lib/grids/common/grid.interface';

@Component({
    selector: 'app-grid-row-pinning-sample',
    styleUrls: ['grid-row-pinning.sample.css'],
    templateUrl: 'grid-row-pinning.sample.html',
    providers: [
        { provide: IgxGridTransaction, useClass: IgxTransactionService },
        { provide: DisplayDensityToken, useValue: { displayDensity: DisplayDensity.comfortable} }
    ],
})

export class GridRowPinningSampleComponent implements OnInit {
    public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.Start };

    public options = {
        cellSelection: true,
        rowSelection: true,
        filtering: true,
        advancedFiltering: true,
        paging: true,
        sorting: true,
        groupBy: true,
        columns: false,
        rowPinning: true,
        pinningConfig: true
    };

    @ViewChild('grid1', { static: true })
    grid1: IgxGridComponent;

	@ViewChild('hGrid', { static: true })
    hGrid: IgxHierarchicalGridComponent;

    @ViewChild(IgxGridStateDirective, { static: true }) public state: IgxGridStateDirective;

    constructor(@Inject(DisplayDensityToken) public displayDensityOptions: IDisplayDensityOptions, private excelExportService: IgxExcelExporterService) {
    }

    onRowChange() {
        if (this.pinningConfig.rows === RowPinningPosition.Bottom) {
            this.pinningConfig = { columns: this.pinningConfig.columns, rows: RowPinningPosition.Top };
        } else {
            this.pinningConfig = { columns: this.pinningConfig.columns, rows: RowPinningPosition.Bottom };
        }
    }

    onChange() {
        if (this.pinningConfig.columns === ColumnPinningPosition.End) {
            this.pinningConfig = { columns: ColumnPinningPosition.Start, rows: this.pinningConfig.rows };
        } else {
            this.pinningConfig = { columns: ColumnPinningPosition.End, rows: this.pinningConfig.rows };
        }
    }

    data: any[];
    hierarchicalData: any[];
    columns: any[];
    hColumns: any[];

    ngOnInit(): void {
        this.columns = [
            { field: 'ID', width: '200px', hidden: true },
            { field: 'CompanyName', width: '200px', groupable: true },
            { field: 'ContactName', width: '200px', pinned: false, groupable: true },
            { field: 'ContactTitle', width: '300px', pinned: false, groupable: true },
            { field: 'Address', width: '250px' },
            { field: 'City', width: '200px' },
            { field: 'Region', width: '300px' },
            { field: 'PostalCode', width: '150px' },
            { field: 'Phone', width: '200px' },
            { field: 'Fax', width: '200px' }
        ];

        this.hColumns = [
            { field: 'ID', width: '200px' },
            { field: 'ChildLevels', width: '200px' },
            { field: 'ProductName', width: '200px' },
            { field: 'Col1', width: '200px' },
            { field: 'Col2', width: '200px' },
            { field: 'Col3', width: '200px' },
            { field: 'childData', width: '200px' },
            { field: 'childData2', width: '200px' },
            { field: 'hasChild', width: '200px' }
        ]

        this.data = [
            // tslint:disable:max-line-length
            { 'ID': 'ALFKI', 'CompanyName': 'Alfreds Futterkiste', 'ContactName': 'Maria Anders', 'ContactTitle': 'Sales Representative', 'Address': 'Obere Str. 57', 'City': 'Berlin', 'Region': null, 'PostalCode': '12209', 'Country': 'Germany', 'Phone': '030-0074321', 'Fax': '030-0076545' },
            { 'ID': 'ANATR', 'CompanyName': 'Ana Trujillo Emparedados y helados', 'ContactName': 'Ana Trujillo', 'ContactTitle': 'Owner', 'Address': 'Avda. de la Constitución 2222', 'City': 'México D.F.', 'Region': null, 'PostalCode': '05021', 'Country': 'Mexico', 'Phone': '(5) 555-4729', 'Fax': '(5) 555-3745' },
            { 'ID': 'ANTON', 'CompanyName': 'Antonio Moreno Taquería', 'ContactName': 'Antonio Moreno', 'ContactTitle': 'Owner', 'Address': 'Mataderos 2312', 'City': 'México D.F.', 'Region': null, 'PostalCode': '05023', 'Country': 'Mexico', 'Phone': '(5) 555-3932', 'Fax': null },
            { 'ID': 'AROUT', 'CompanyName': 'Around the Horn', 'ContactName': 'Thomas Hardy', 'ContactTitle': 'Sales Representative', 'Address': '120 Hanover Sq.', 'City': 'London', 'Region': null, 'PostalCode': 'WA1 1DP', 'Country': 'UK', 'Phone': '(171) 555-7788', 'Fax': '(171) 555-6750' },
            { 'ID': 'BERGS', 'CompanyName': 'Berglunds snabbköp', 'ContactName': 'Christina Berglund', 'ContactTitle': 'Order Administrator', 'Address': 'Berguvsvägen 8', 'City': 'Luleå', 'Region': null, 'PostalCode': 'S-958 22', 'Country': 'Sweden', 'Phone': '0921-12 34 65', 'Fax': '0921-12 34 67' },
            { 'ID': 'BLAUS', 'CompanyName': 'Blauer See Delikatessen', 'ContactName': 'Hanna Moos', 'ContactTitle': 'Sales Representative', 'Address': 'Forsterstr. 57', 'City': 'Mannheim', 'Region': null, 'PostalCode': '68306', 'Country': 'Germany', 'Phone': '0621-08460', 'Fax': '0621-08924' },
            { 'ID': 'BLONP', 'CompanyName': 'Blondesddsl père et fils', 'ContactName': 'Frédérique Citeaux', 'ContactTitle': 'Marketing Manager', 'Address': '24, place Kléber', 'City': 'Strasbourg', 'Region': null, 'PostalCode': '67000', 'Country': 'France', 'Phone': '88.60.15.31', 'Fax': '88.60.15.32' },
            { 'ID': 'BOLID', 'CompanyName': 'Bólido Comidas preparadas', 'ContactName': 'Martín Sommer', 'ContactTitle': 'Owner', 'Address': 'C/ Araquil, 67', 'City': 'Madrid', 'Region': null, 'PostalCode': '28023', 'Country': 'Spain', 'Phone': '(91) 555 22 82', 'Fax': '(91) 555 91 99' },
            { 'ID': 'BONAP', 'CompanyName': 'Bon app\'', 'ContactName': 'Laurence Lebihan', 'ContactTitle': 'Owner', 'Address': '12, rue des Bouchers', 'City': 'Marseille', 'Region': null, 'PostalCode': '13008', 'Country': 'France', 'Phone': '91.24.45.40', 'Fax': '91.24.45.41' },
            { 'ID': 'BOTTM', 'CompanyName': 'Bottom-Dollar Markets', 'ContactName': 'Elizabeth Lincoln', 'ContactTitle': 'Accounting Manager', 'Address': '23 Tsawassen Blvd.', 'City': 'Tsawassen', 'Region': 'BC', 'PostalCode': 'T2F 8M4', 'Country': 'Canada', 'Phone': '(604) 555-4729', 'Fax': '(604) 555-3745' },
            { 'ID': 'BSBEV', 'CompanyName': 'B\'s Beverages', 'ContactName': 'Victoria Ashworth', 'ContactTitle': 'Sales Representative', 'Address': 'Fauntleroy Circus', 'City': 'London', 'Region': null, 'PostalCode': 'EC2 5NT', 'Country': 'UK', 'Phone': '(171) 555-1212', 'Fax': null },
            { 'ID': 'CACTU', 'CompanyName': 'Cactus Comidas para llevar', 'ContactName': 'Patricio Simpson', 'ContactTitle': 'Sales Agent', 'Address': 'Cerrito 333', 'City': 'Buenos Aires', 'Region': null, 'PostalCode': '1010', 'Country': 'Argentina', 'Phone': '(1) 135-5555', 'Fax': '(1) 135-4892' },
            { 'ID': 'CENTC', 'CompanyName': 'Centro comercial Moctezuma', 'ContactName': 'Francisco Chang', 'ContactTitle': 'Marketing Manager', 'Address': 'Sierras de Granada 9993', 'City': 'México D.F.', 'Region': null, 'PostalCode': '05022', 'Country': 'Mexico', 'Phone': '(5) 555-3392', 'Fax': '(5) 555-7293' },
            { 'ID': 'CHOPS', 'CompanyName': 'Chop-suey Chinese', 'ContactName': 'Yang Wang', 'ContactTitle': 'Owner', 'Address': 'Hauptstr. 29', 'City': 'Bern', 'Region': null, 'PostalCode': '3012', 'Country': 'Switzerland', 'Phone': '0452-076545', 'Fax': null },
            { 'ID': 'COMMI', 'CompanyName': 'Comércio Mineiro', 'ContactName': 'Pedro Afonso', 'ContactTitle': 'Sales Associate', 'Address': 'Av. dos Lusíadas, 23', 'City': 'Sao Paulo', 'Region': 'SP', 'PostalCode': '05432-043', 'Country': 'Brazil', 'Phone': '(11) 555-7647', 'Fax': null },
            { 'ID': 'CONSH', 'CompanyName': 'Consolidated Holdings', 'ContactName': 'Elizabeth Brown', 'ContactTitle': 'Sales Representative', 'Address': 'Berkeley Gardens 12 Brewery', 'City': 'London', 'Region': null, 'PostalCode': 'WX1 6LT', 'Country': 'UK', 'Phone': '(171) 555-2282', 'Fax': '(171) 555-9199' },
            { 'ID': 'DRACD', 'CompanyName': 'Drachenblut Delikatessen', 'ContactName': 'Sven Ottlieb', 'ContactTitle': 'Order Administrator', 'Address': 'Walserweg 21', 'City': 'Aachen', 'Region': null, 'PostalCode': '52066', 'Country': 'Germany', 'Phone': '0241-039123', 'Fax': '0241-059428' },
            { 'ID': 'DUMON', 'CompanyName': 'Du monde entier', 'ContactName': 'Janine Labrune', 'ContactTitle': 'Owner', 'Address': '67, rue des Cinquante Otages', 'City': 'Nantes', 'Region': null, 'PostalCode': '44000', 'Country': 'France', 'Phone': '40.67.88.88', 'Fax': '40.67.89.89' },
            { 'ID': 'EASTC', 'CompanyName': 'Eastern Connection', 'ContactName': 'Ann Devon', 'ContactTitle': 'Sales Agent', 'Address': '35 King George', 'City': 'London', 'Region': null, 'PostalCode': 'WX3 6FW', 'Country': 'UK', 'Phone': '(171) 555-0297', 'Fax': '(171) 555-3373' },
            { 'ID': 'ERNSH', 'CompanyName': 'Ernst Handel', 'ContactName': 'Roland Mendel', 'ContactTitle': 'Sales Manager', 'Address': 'Kirchgasse 6', 'City': 'Graz', 'Region': null, 'PostalCode': '8010', 'Country': 'Austria', 'Phone': '7675-3425', 'Fax': '7675-3426' },
            { 'ID': 'FAMIA', 'CompanyName': 'Familia Arquibaldo', 'ContactName': 'Aria Cruz', 'ContactTitle': 'Marketing Assistant', 'Address': 'Rua Orós, 92', 'City': 'Sao Paulo', 'Region': 'SP', 'PostalCode': '05442-030', 'Country': 'Brazil', 'Phone': '(11) 555-9857', 'Fax': null },
            { 'ID': 'FISSA', 'CompanyName': 'FISSA Fabrica Inter. Salchichas S.A.', 'ContactName': 'Diego Roel', 'ContactTitle': 'Accounting Manager', 'Address': 'C/ Moralzarzal, 86', 'City': 'Madrid', 'Region': null, 'PostalCode': '28034', 'Country': 'Spain', 'Phone': '(91) 555 94 44', 'Fax': '(91) 555 55 93' },
            { 'ID': 'FOLIG', 'CompanyName': 'Folies gourmandes', 'ContactName': 'Martine Rancé', 'ContactTitle': 'Assistant Sales Agent', 'Address': '184, chaussée de Tournai', 'City': 'Lille', 'Region': null, 'PostalCode': '59000', 'Country': 'France', 'Phone': '20.16.10.16', 'Fax': '20.16.10.17' },
            { 'ID': 'FOLKO', 'CompanyName': 'Folk och fä HB', 'ContactName': 'Maria Larsson', 'ContactTitle': 'Owner', 'Address': 'Åkergatan 24', 'City': 'Bräcke', 'Region': null, 'PostalCode': 'S-844 67', 'Country': 'Sweden', 'Phone': '0695-34 67 21', 'Fax': null },
            { 'ID': 'FRANK', 'CompanyName': 'Frankenversand', 'ContactName': 'Peter Franken', 'ContactTitle': 'Marketing Manager', 'Address': 'Berliner Platz 43', 'City': 'München', 'Region': null, 'PostalCode': '80805', 'Country': 'Germany', 'Phone': '089-0877310', 'Fax': '089-0877451' },
            { 'ID': 'FRANR', 'CompanyName': 'France restauration', 'ContactName': 'Carine Schmitt', 'ContactTitle': 'Marketing Manager', 'Address': '54, rue Royale', 'City': 'Nantes', 'Region': null, 'PostalCode': '44000', 'Country': 'France', 'Phone': '40.32.21.21', 'Fax': '40.32.21.20' },
            { 'ID': 'FRANS', 'CompanyName': 'Franchi S.p.A.', 'ContactName': 'Paolo Accorti', 'ContactTitle': 'Sales Representative', 'Address': 'Via Monte Bianco 34', 'City': 'Torino', 'Region': null, 'PostalCode': '10100', 'Country': 'Italy', 'Phone': '011-4988260', 'Fax': '011-4988261' }
        ];
        this.hierarchicalData = this.generateDataUneven(100, 3);
        this
        // tslint:enable:max-line-length
    }

    togglePinRow(index) {
        const rec = this.data[index];
        this.grid1.isRecordPinned(rec) ?
            this.grid1.pinRow(this.data[index]) :
            this.grid1.unpinRow(this.data[index])
    }

    togglePining(row: IgxGridRowComponent, event) {
        event.preventDefault();
        if (row.pinned) {
            row.unpin();
        } else {
            row.pin();
        }
    }

    clickUnpin() {
        this.grid1.unpinRow('aaaa');
    }

    generateDataUneven(count: number, level: number, parendID: string = null) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
            if (level > 0) {
                // Have child grids for row with even id less rows by not multiplying by 2
                children = this.generateDataUneven(((i % 2) + 1) * Math.round(count / 3), currLevel - 1, rowID);
            }
            prods.push({
                ID: rowID,
                ChildLevels: currLevel,
                ProductName: 'Product: A' + i,
                Col1: i,
                Col2: i,
                Col3: i,
                childData: children,
                childData2: children,
                hasChild: true
            });
        }
        return prods;
    }

    public isPinned(cell) {
        console.log(cell);
        return true;
    }

    public exportButtonHandler() {
        this.excelExportService.export(this.grid1, new IgxExcelExporterOptions("ExportFileFromGrid"));
    }

    public saveGridState() {
        const state = this.state.getState() as string;
        window.localStorage.setItem("grid1-state", state);
    }

    public restoreGridState() {
        const state = window.localStorage.getItem("grid1-state");
        this.state.setState(state);
    }

    toggleDensity() {
        switch (this.displayDensityOptions.displayDensity ) {
            case DisplayDensity.comfortable: this.displayDensityOptions.displayDensity = DisplayDensity.compact; break;
            case DisplayDensity.compact: this.displayDensityOptions.displayDensity = DisplayDensity.cosy; break;
            case DisplayDensity.cosy: this.displayDensityOptions.displayDensity = DisplayDensity.comfortable; break;
        }
    }
}
