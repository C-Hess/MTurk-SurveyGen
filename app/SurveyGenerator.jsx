import { url } from "inspector";
import React from "react";
import ReactDomServer from "react-dom/server";

class SurveyGenerator {
  xmlHeader = `
  <HTMLQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2011-11-11/HTMLQuestion.xsd">
    <HTMLContent>
        <![CDATA[<!DOCTYPE html>`;

  xmlFooter = `]]></HTMLContent><FrameHeight>450</FrameHeight></HTMLQuestion>`;

  getHTML = (
    questions,
    questionDescription,
    randomizeControlOrder,
    isPreview = false
  ) => {
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
              {this.getQuestions(
                questions,
                questionDescription,
                randomizeControlOrder
              )}
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

  getURLContent = url => {
    const videoURLRegex = /youtu(be\.com|\.be)\/(watch\?v=|embed)?\/?([a-zA-Z0-9_-]+)(&.*)?/;
    const youtubeMatchURL = videoURLRegex.exec(url);
    const isYoutubeURL = youtubeMatchURL != null;
    if (isYoutubeURL) {
      const urlYoutubeID = youtubeMatchURL[3];
      return {
        type: "video",
        embed: (
          <div className="embed-responsive embed-responsive-16by9">
            <iframe
              src={
                "https://www.youtube-nocookie.com/embed/" +
                urlYoutubeID +
                "?modestbranding=0&rel=0&showinfo=0"
              }
              frameBorder="0"
              allow="encrypted-media"
              allowFullScreen={true}
            />
          </div>
        )
      };
    } else {
      return {
        type: "image",
        embed: <img className="img-fluid" src={url} />
      };
    }
  };

  getRadioButton = (index, type, isLeft, isControl) => {
    return (
      <div className="form-check text-center mt-2">
        <input
          className="form-check-input"
          type="radio"
          name={"question" + index}
          value={isControl ? "c" : "e"}
        />
        <label className="form-check-label">
          {isLeft ? "Left" : "Right"} {type}
        </label>
      </div>
    );
  };

  getSingleURLQuestion = (question, index) => {
    const questionContent = this.getURLContent(question.urls[0]);
    return (
      <div>
        {questionContent.embed}
        <div className="row">
          <div className="col-sm">
            {this.getRadioButton(
              index,
              questionContent.type,
              true,
              question.isControlLeft
            )}
          </div>
          <div className="col-sm">
            {this.getRadioButton(
              index,
              questionContent.type,
              false,
              !question.isControlLeft
            )}
          </div>
        </div>
      </div>
    );
  };

  getTwoURLQuestion = (question, index, randomizeControlOrder) => {
    const urls = question.urls;
    let leftQuestionContent = this.getURLContent(urls[0]);
    let rightQuestionContent = this.getURLContent(urls[1]);
    let isControlLeft = true;

    if (randomizeControlOrder) {
      console.log("Here");
      if (Math.random() >= 0.5) {
        const tmp = rightQuestionContent;
        rightQuestionContent = leftQuestionContent;
        leftQuestionContent = tmp;
        isControlLeft = false;
      }
    }

    return (
      <div className="row">
        <div className="col-sm">
          {leftQuestionContent.embed}
          {this.getRadioButton(
            index,
            leftQuestionContent.type,
            true,
            isControlLeft
          )}
        </div>
        <div className="col-sm">
          {rightQuestionContent.embed}
          {this.getRadioButton(
            index,
            rightQuestionContent.type,
            false,
            !isControlLeft
          )}
        </div>
      </div>
    );
  };

  getQuestions = (questions, questionDescription, randomizeControlOrder) => {
    console.log("2. " + randomizeControlOrder);
    let htmlQuestions = questions.map((question, index) => {
      return (
        <div key={index} className="card my-2 mx-5">
          <div className="card-body">
            <div className="card-title">
              <h4>
                <strong>Question {index + 1}:</strong>
                {" " + questionDescription}
              </h4>
            </div>
            <div className="container">
              {question.urls.length == 1
                ? this.getSingleURLQuestion(question, index)
                : this.getTwoURLQuestion(
                    question,
                    index,
                    randomizeControlOrder
                  )}
            </div>
          </div>
        </div>
      );
    });
    return htmlQuestions;
  };

  getPreviewDocument = (
    questions,
    questionDescription,
    randomizeControlOrder
  ) => {
    console.log("1. " + randomizeControlOrder);
    return this.getHTML(
      questions,
      questionDescription,
      randomizeControlOrder,
      true
    );
  };

  getDocument = (questions, questionDescription, randomizeControlOrder) => {
    return (
      this.xmlHeader +
      this.getHTML(questions, questionDescription, randomizeControlOrder) +
      this.xmlFooter
    );
  };
}

export default SurveyGenerator;
