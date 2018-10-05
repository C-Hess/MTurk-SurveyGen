class SurveyGenerator {
  xmlHeader = `
  <HTMLQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2011-11-11/HTMLQuestion.xsd">
    <HTMLContent>
        <![CDATA[`;

  xmlFooter = `]]></HTMLContent><FrameHeight>450</FrameHeight></HTMLQuestion>`;

  getHTMLHeader = isPreview => {
    if (isPreview) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <link
            rel="stylesheet"
            href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
            integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO"
            crossorigin="anonymous"
          />
        </head>
        <body>
        <div class="mx-2 my-2">
          <h2 class="border-bottom my-3">Instructions</h2>
          <ul class="text-info">
            <li>Answer each question below</li>
            <li>When all questions are answered, click the "Submit" button</li>
          </ul>
          <h2 class="border-bottom my-3">Questions</h2>
          <form
            name="mturk_form"
            method="post"
            id="mturk_form"
          >
            <input type="hidden" value="" name="assignmentId" id="assignmentId" />
          `;
    }
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <script
          type="text/javascript"
          src="https://s3.amazonaws.com/mturk-public/externalHIT_v1.js"
        ></script>
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
          integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO"
          crossorigin="anonymous"
        />
      </head>
      <body>
      <div class="mx-2 my-2">
        <h2 class="border-bottom my-3">Instructions</h2>
        <ul class="text-info">
          <li>Answer each question below</li>
          <li>When all questions are answered, click the "Submit" button</li>
        </ul>
        <h2 class="border-bottom my-3">Questions</h2>
        <form
          name="mturk_form"
          method="post"
          id="mturk_form"
          action="https://www.mturk.com/mturk/externalSubmit"
        >
          <input type="hidden" value="" name="assignmentId" id="assignmentId" />
        `;
  };

  getHTMLFooter = isPreview => {
    if (isPreview) {
      return `
        <input
            class="btn btn-primary mb-2"
            type="submit"
            id="submitButton"
            value="Submit"
          />
        </form>
        </div>
        </body>
        </html>
        `;
    }
    return `
      <input
          class="btn btn-primary mb-2"
          type="submit"
          id="submitButton"
          value="Submit"
        />
      </form>
      </div>
      <script language="Javascript">
        turkSetAssignmentID();
      </script>
      </body>
      </html>
      `;
  };

  getQuestions = (questionPairs, questionDescription) => {
    let htmlQuestions = questionPairs.map((questionPair, index) => {
      let videoURLRegex = /youtu(be\.com|\.be)\/(watch\?v=|embed)?\/?([a-zA-Z1-9_-]+)(&.*)?/;
      let matchControl = videoURLRegex.exec(questionPair.controlURL);
      let matchExperiemental = videoURLRegex.exec(questionPair.experimentalURL);
      let controlURL = null;
      let experimentalURL = null;
      if (matchControl != null) {
        controlURL = matchControl[3];
      }
      if (matchExperiemental != null) {
        experimentalURL = matchExperiemental[3];
      }
      return (
        `
        <div class="card my-2 mx-5">
          <div class="card-body">
            <div class="card-title">
            <h4>
              <strong>Question ` +
        (index + 1) +
        `:</strong> ` +
        questionDescription +
        `
            </h4>
            </div>
            <div class="container">
              <div class="row">
                <div class="col-sm">
                  <div class="embed-responsive embed-responsive-16by9">
                    <iframe
                      src="https://www.youtube-nocookie.com/embed/` +
        controlURL +
        `?rel=0&amp;showinfo=0"
                      frameborder="0"
                      allow="autoplay; encrypted-media"
                      allowfullscreen
                    ></iframe>
                  </div>
                  <div class="form-check text-center mt-2">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="question` +
        index +
        `"
                      value="c"
                    />
                    <label class="form-check-label">Video A</label>
                  </div>
                </div>
                <div class="col-sm">
                  <div class="embed-responsive embed-responsive-16by9">
                    <iframe
                      src="https://www.youtube-nocookie.com/embed/` +
        experimentalURL +
        `?rel=0&amp;showinfo=0"
                      frameborder="0"
                      allow="autoplay; encrypted-media"
                      allowfullscreen
                    ></iframe>
                  </div>
                  <div class="form-check text-center mt-2">
                    <input
                      class="form-check-input"
                      type="radio"
                      name="question` +
        index +
        `"
                      value="e"
                    />
                    <label class="form-check-label">Video B</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
      );
    });
    return htmlQuestions.join("");
  };

  getPreviewDocument = (questionPairs, questionDescription) => {
    return (
      this.getHTMLHeader(true) +
      this.getQuestions(questionPairs, questionDescription) +
      this.getHTMLFooter(true)
    );
  };

  getDocument = (questionPairs, questionDescription) => {
    return (
      this.xmlHeader +
      this.getHTMLHeader(false) +
      this.getQuestions(questionPairs, questionDescription) +
      this.getHTMLFooter(false) +
      this.xmlFooter
    );
  };
}

export default SurveyGenerator;
