
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
    parsingRule = null;

    // TODO We might want to inject the parsingRule instead of
    // grabbing it from inside the Parser class
    constructor(frameType: string)
    {
        switch (frameType)
        {
            case Frame.TYPE_TACTIC:
                this.parsingRule = new ParsingRuleTactic();
                break;
            // parsingRule must alwasy be defined
            default:
                this.parsingRule = new ParsingRuleBoring();
                break;
        }
    }

    parse(document: HTMLDocument)
    {
        return this.parsingRule.parse(document);
    }
}

// TODO Abstract this class - Extend with more specific classes!
class ParsingRuleTactic
{
    parse(document: HTMLDocument)
    {
        let dataFields = document.getElementsByTagName('center');

        // TODO
        let finalData = dataFields;
        // TODO

        return finalData;
    }
}

// TODO Abstract this class - Extend with more specific classes!
class ParsingRuleBoring
{
    parse(document: HTMLDocument)
    {
        let finalData = 'boring!';
        return finalData;
    }
}
