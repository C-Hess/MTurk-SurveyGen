import { url } from "inspector";
import React from "react";
import ReactDomServer from "react-dom/server";

class SurveyGenerator {
  xmlHeader = `
  <HTMLQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2011-11-11/HTMLQuestion.xsd">
    <HTMLContent>
        <![CDATA[<!DOCTYPE html>`;

  xmlFooter = `]]></HTMLContent><FrameHeight>450</FrameHeight></HTMLQuestion>`;

  getHTML = (questions, questionDescription, isPreview) => {
    return ReactDomServer.renderToString(
      <html>
        <head>
          <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
          <link
            rel="stylesheet"
            href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
            integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO"
            crossOrigin="anonymous"
          />
          {!isPreview && (
            <script
              type="text/javascript"
              src="https://s3.amazonaws.com/mturk-public/externalHIT_v1.js"
            />
          )}
        </head>
        <body>
          <div className="mx-2 my-2">
            <h2 className="border-bottom my-3">Instructions</h2>
            <ul className="text-info">
              <li>Answer each question below</li>
              <li>
                When all questions are answered, click the "Submit" button
              </li>
            </ul>
            <h2 className="border-bottom my-3">Questions</h2>
            <form
              name="mturk_form"
              method="post"
              id="mturk_form"
              action={
                isPreview ? null : "https://www.mturk.com/mturk/externalSubmit"
              }
            >
              <input
                type="hidden"
                value=""
                name="assignmentId"
                id="assignmentId"
              />
              {this.getQuestions(questions, questionDescription)}
              <input
                className="btn btn-primary mb-2"
                type="submit"
                id="submitButton"
                value="Submit"
              />
            </form>
          </div>
          {!isPreview && (
            <script language="Javascript">turkSetAssignmentID();</script>
          )}
        </body>
      </html>
    );
  };

  getSingleURLQuestion = (question, index) => {
    const videoURLRegex = /youtu(be\.com|\.be)\/(watch\?v=|embed)?\/?([a-zA-Z1-9_-]+)(&.*)?/;
    const urls = question.urls;
    const youtubeMatchURL = videoURLRegex.exec(urls[0]);
    const isControlLeft = question.isControlLeft;
    let urlYoutubeID = null;
    if (youtubeMatchURL != null) {
      urlYoutubeID = youtubeMatchURL[3];
    }

    return (
      <div>
        <div className="embed-responsive embed-responsive-16by9">
          <iframe
            src={
              "https://www.youtube-nocookie.com/embed/" +
              urlYoutubeID +
              "?modestbranding=0&rel=0&showinfo=0"
            }
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
          />
        </div>
        <div className="row">
          <div className="col-sm">
            <div className="form-check text-center mt-2">
              <input
                className="form-check-input"
                type="radio"
                name={"question" + index}
                value={isControlLeft ? "c" : "e"}
              />
              <label className="form-check-label">Left video</label>
            </div>
          </div>
          <div className="col-sm">
            <div className="form-check text-center mt-2">
              <input
                className="form-check-input"
                type="radio"
                name={"question" + index}
                value={isControlLeft ? "e" : "c"}
              />
              <label className="form-check-label">Right video</label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  getTwoURLQuestion = (question, index) => {
    const videoURLRegex = /youtu(be\.com|\.be)\/(watch\?v=|embed)?\/?([a-zA-Z0-9_-]+)(&.*)?/;
    const urls = question.urls;
    const youtubeMatchControlURL = videoURLRegex.exec(urls[0]);
    let controlYoutubeID = null;
    if (youtubeMatchControlURL != null) {
      controlYoutubeID = youtubeMatchControlURL[3];
    }

    const youtubeMatchExperimentalURL = videoURLRegex.exec(urls[1]);
    let experimentalYoutubeID = null;
    if (youtubeMatchExperimentalURL != null) {
      experimentalYoutubeID = youtubeMatchExperimentalURL[3];
    }
    return (
      <div className="row">
        <div className="col-sm">
          <div className="embed-responsive embed-responsive-16by9">
            <iframe
              src={
                "https://www.youtube-nocookie.com/embed/" +
                controlYoutubeID +
                "?modestbranding=0&rel=0&showinfo=0"
              }
              frameborder="0"
              allow="encrypted-media"
              allowfullscreen
            />
          </div>
          <div className="form-check text-center mt-2">
            <input
              className="form-check-input"
              type="radio"
              name={"question" + index}
              value="c"
            />
            <label className="form-check-label">Left video</label>
          </div>
        </div>
        <div className="col-sm">
          <div className="embed-responsive embed-responsive-16by9">
            <iframe
              src={
                "https://www.youtube-nocookie.com/embed/" +
                experimentalYoutubeID +
                "?modestbranding=0&rel=0&showinfo=0"
              }
              frameborder="0"
              allow="encrypted-media"
              allowfullscreen
            />
          </div>
          <div className="form-check text-center mt-2">
            <input
              className="form-check-input"
              type="radio"
              name={"question" + index}
              value="e"
            />
            <label className="form-check-label">Right video</label>
          </div>
        </div>
      </div>
    );
  };

  getQuestions = (questions, questionDescription) => {
    let htmlQuestions = questions.map((question, index) => {
      return (
        <div className="card my-2 mx-5">
          <div className="card-body">
            <div className="card-title">
              <h4>
                <strong>
                  Question {index + 1}:{"\u00A0"}
                </strong>
                {questionDescription}
              </h4>
            </div>
            <div className="container">
              {question.urls.length == 1
                ? this.getSingleURLQuestion(question)
                : this.getTwoURLQuestion(question)}
            </div>
          </div>
        </div>
      );
    });
    return htmlQuestions;
  };

  getPreviewDocument = (questions, questionDescription) => {
    return this.getHTML(questions, questionDescription, true);
  };

  getDocument = (questions, questionDescription) => {
    return (
      this.xmlHeader +
      this.getHTML(questions, questionDescription, false) +
      this.xmlFooter
    );
  };
}

export default SurveyGenerator;
