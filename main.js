
document.body.style.border = "5px solid red";

var targetFrame = document.getElementsByName("mainFrame")[0];

targetFrame.onload = function() {
    if (targetFrame.contentDocument.baseURI == "https://www.galaxy-network.net/game/gala-taktik.php")
    {
        console.log('Tactic Screen!');
        let frame = new Frame(targetFrame);
        console.log(frame);
    } else {
        console.log('Some other Screen');
    }
}

class Frame {
    constructor(reference) {
        this.reference = reference;
    }
}
