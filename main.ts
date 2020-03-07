
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
            // parser must not be undefined
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

        let fleetMovementTableData: Array<Array<string>> = TableParser.parse(dataFields[0]);
        let galaxyMembersTableData: Array<Array<string>> = TableParser.parse(dataFields[1]);

        // TODO create galaxyMembersData (to provide sector scans to TIC)

        let fleetMovementData = FleetMovementDataMapper.map(fleetMovementTableData);

        return
        [
            fleetMovementData
        ];
    }
}

/* #region ###########################################  Data Mappers  ################################################ */

class FleetMovementDataMapper
{
    static readonly ROW_FIELDS_MAP =
    [
        function(data: string) {
            return new CoordsField(data);
        },
        function(data: string) {
            return new NameField(data);
        },
        function(data: string) {
            return new AttackingField(data);
        },
        function(data: string) {
            return new AttackingTimeField(data);
        },
        function(data: string) {
            return new DefendingField(data);
        },
        function(data: string) {
            return new DefendingTimeField(data);
        },
        function(data: string) {
            return new IsAttackedByField(data);
        },
        function(data: string) {
            return new IsAttackedByTimeField(data);
        },
        function(data: string) {
            return new IsDefendedByField(data);
        },
        function(data: string) {
            return new IsDefendedByTimeField(data);
        }
    ];

    static map (fleetMovementTableData: Array<Array<string>>): Array<Array<Array<string>>>
    {
        // TODO What could we type hint here instead of <any>?
        // AbstractField doesn't work :/
        let fleetMovementData: Array<any> = [];
        for (const dataSet of fleetMovementTableData) {
            let fleetMovementRowData = dataSet.map(function callback( data:string, index: number) {
                // return element for new_array
                return FleetMovementDataMapper.ROW_FIELDS_MAP[index](data);
            })
            fleetMovementData.push(fleetMovementRowData);
        }
        return fleetMovementData;
    }
}

/* #endregion */

/* #region ########################################  Generic Parsers  ################################################ */

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

/* #endregion */

/* #region #############################################  Fields  #################################################### */

/* #region ########################################  Abstract Fields  ################################################ */

abstract class AbstractField
{
    static readonly TYPE_DEFAULT = 'default';

    static readonly TYPE_ABSTRACT_TIME = 'abstract_time';
    static readonly TYPE_ABSTRACT_NO_NEWLINE = 'abstract_no_newline';

    static readonly TYPE_COORDS = 'coords';
    static readonly TYPE_NAME = 'name';

    static readonly TYPE_ATTACKING = 'attacking';
    static readonly TYPE_ATTACKING_TIME = 'attacking_time';
    static readonly TYPE_DEFENDING = 'defending';
    static readonly TYPE_DEFENDING_TIME = 'defending_time';

    static readonly TYPE_IS_ATTACKED_BY = 'is_attacked_by';
    static readonly TYPE_IS_ATTACKED_BY_TIME = 'is_attacked_by_time';
    static readonly TYPE_DEFENDED_BY = 'is_defended_by';
    static readonly TYPE_DEFENDED_BY_TIME = 'is_defended_by_TIME';

    type: string = AbstractField.TYPE_DEFAULT;
    internalValue: string;

    constructor(data: string = '') {
        this.value = data;
    }

    get value()
    {
        return this.internalValue;
    }

    /**
     * Subclasses overwrite this method to implement their own
     * way of grabbing value from data.
     */
    set value(data: string)
    {
        this.internalValue = data;
    }
}

class AbstractNoNewlineField extends AbstractField
{
    type: string = AbstractField.TYPE_ABSTRACT_NO_NEWLINE;

    // There is a newline in this field, even though
    // it's not really visible in the UI
    set value(data: string)
    {
        this.internalValue = data.replace("\n","")
    }
}

class AbstractTimeField extends AbstractNoNewlineField
{
    type: string = AbstractField.TYPE_ABSTRACT_TIME;
}

/* #endregion */

class CoordsField extends AbstractField
{
    type: string = AbstractField.TYPE_COORDS;

    // parent class' constructor is automatically called
    // The only thing relevant is setting the type
}

class NameField extends AbstractField
{
    type: string = AbstractField.TYPE_NAME;

    // If a player is active or was active recently
    // a "*" is added to his nickname. This needs to be removed.
    set value(data: string)
    {
        this.internalValue = data.replace(" *", "");
    }
}

class AttackingField extends AbstractNoNewlineField
{
    type: string = AbstractField.TYPE_ATTACKING;

    // TODO Special case: Rückflug!
}

class AttackingTimeField extends AbstractTimeField
{
    type: string = AbstractField.TYPE_ATTACKING_TIME;
}

class DefendingField extends AbstractNoNewlineField
{
    type: string = AbstractField.TYPE_DEFENDING;

    // TODO Special case: Rückflug!
}

class DefendingTimeField extends AbstractTimeField
{
    type: string = AbstractField.TYPE_DEFENDING_TIME;
}

// TODO coords + nickname <- gotta devide?
class IsAttackedByField extends AbstractNoNewlineField
{
    type: string = AbstractField.TYPE_IS_ATTACKED_BY;
}

class IsAttackedByTimeField extends AbstractTimeField
{
    type: string = AbstractField.TYPE_IS_ATTACKED_BY_TIME;
}

// TODO coords + nickname <- gotta devide?
class IsDefendedByField extends AbstractNoNewlineField
{
    type: string = AbstractField.TYPE_DEFENDED_BY;
}

class IsDefendedByTimeField extends AbstractTimeField
{
    type: string = AbstractField.TYPE_DEFENDED_BY_TIME;
}

/* #endregion */
