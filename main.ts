
document.body.style.border = "5px solid red";

var config =
{
    'urls':
    {
        'tactic': "https://www.galaxy-network.net/game/gala-taktik.php"
    }
};

var targetFrame = document.getElementsByName("mainFrame")[0];

targetFrame.onload = function()
{
    let frame = new Frame(targetFrame);
    console.log(frame.extractTicData());
}

// TODO Define known frames
class Frame
{
    static readonly TYPE_BORING = 'boring';
    static readonly TYPE_TACTIC = 'tactic';

    reference = null;
    parser = null;

    constructor(reference)
    {
        this.reference = reference;
        this.parser = new FrameDataParser(this.type);
    }

    // Getter
    get type()
    {
        switch (this.reference.contentDocument.baseURI)
        {
            case config.urls.tactic:
                return Frame.TYPE_TACTIC;
            default:
                return Frame.TYPE_BORING;
        }
    }

    extractTicData()
    {
        return this.parser.parse(this.reference.contentDocument);
    }
}

class FrameDataParser
{
    parser = null;

    // TODO We might want to inject the parser instead of
    // grabbing it from inside the Parser class
    constructor(frameType: string)
    {
        switch (frameType)
        {
            case Frame.TYPE_TACTIC:
                this.parser = new TacticParser();
                break;
            // parser must alwasy be defined
            default:
                this.parser = new BoringParser();
                break;
        }
    }

    parse(document: HTMLDocument)
    {
        return this.parser.parse(document);
    }
}

// TODO Abstract this class - Extend with more specific classes!
class TacticParser
{
    parse(document: HTMLDocument)
    {
        let dataFields = document.getElementsByTagName('center');

        let fleetMovementTableData: object = TableParser.parse(dataFields[0]);
        let galaxyMembersTableData: object = TableParser.parse(dataFields[1]);

        let finalData = '';
        return finalData;
    }
}

/**
 * The TableParser parses a GalaxyNetwork table.
 * It utilizes a TableRowParser to gather data row by row.
*/
class TableParser
{
    static parse(table: Element)
    {
        let rows: HTMLCollection = table.getElementsByClassName('R');

        let tableData = [];

        for (const row of rows)
        {
            // Sadly the 'R' selector above is not case sensitive
            // so we have to make sure only use the ones with
            // a capital 'R'.
            if (row.className == 'R')
            {
                tableData.push(TableRowParser.parse(row));
            }
        }

        return tableData;
    }
}

/**
 * The TableRowParser parses a GalaxyNetwork table row
 * going through it field by field
*/
class TableRowParser
{
    static parse(row: Element)
    {
        let fields = <HTMLCollectionOf<HTMLTableDataCellElement>> row.getElementsByTagName('td');

        let rowData = [];

        for (const field of fields)
        {
            rowData.push(field.innerText);
        }

        return rowData;
    }
}

// TODO Abstract this class - Extend with more specific classes!
class BoringParser
{
    parse(document: HTMLDocument)
    {
        let finalData = 'boring!';
        return finalData;
    }
}
