/* Any copyright is dedicated to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

// Tests that the box model's accordion state is persistent through hide/show in the
// layout view.

const TEST_URI = `
  <style>
    #div1 {
      margin: 10px;
      padding: 3px;
    }
  </style>
  <div id="div1"></div>
`;

const BOXMODEL_OPENED_PREF = "devtools.layout.boxmodel.opened";

add_task(async function() {
  await addTab("data:text/html;charset=utf-8," + encodeURIComponent(TEST_URI));
  let { inspector, boxmodel, toolbox } = await openLayoutView();
  let { document: doc } = boxmodel;

  await testAccordionStateAfterClickingHeader(doc);
  await testAccordionStateAfterSwitchingSidebars(inspector, doc);
  await testAccordionStateAfterReopeningLayoutView(toolbox);

  Services.prefs.clearUserPref(BOXMODEL_OPENED_PREF);
});

function testAccordionStateAfterClickingHeader(doc) {
  let header = doc.querySelector("#layout-container .box-model-pane ._header");
  let bContent = doc.querySelector("#layout-container .box-model-pane ._content");

  info("Checking initial state of the box model panel.");
  is(bContent.style.display, "block", "The box model panel content is 'display: block'.");
  ok(Services.prefs.getBoolPref(BOXMODEL_OPENED_PREF),
    `${BOXMODEL_OPENED_PREF} is pref on by default.`);

  info("Clicking the box model header to hide the box model panel.");
  header.click();

  info("Checking the new state of the box model panel.");
  is(bContent.style.display, "none", "The box model panel content is 'display: none'.");
  ok(!Services.prefs.getBoolPref(BOXMODEL_OPENED_PREF),
    `${BOXMODEL_OPENED_PREF} is pref off.`);
}

function testAccordionStateAfterSwitchingSidebars(inspector, doc) {
  info("Checking the box model accordion state is persistent after switching sidebars.");

  let bContent = doc.querySelector("#layout-container .box-model-pane ._content");

  info("Selecting the computed view.");
  inspector.sidebar.select("computedview");

  info("Selecting the layout view.");
  inspector.sidebar.select("layoutview");

  info("Checking the state of the box model panel.");
  is(bContent.style.display, "none", "The box model panel content is 'display: none'.");
  ok(!Services.prefs.getBoolPref(BOXMODEL_OPENED_PREF),
    `${BOXMODEL_OPENED_PREF} is pref off.`);
}

async function testAccordionStateAfterReopeningLayoutView(toolbox) {
  info("Checking the box model accordion state is persistent after closing and "
  + "re-opening the layout view.");

  info("Closing the toolbox.");
  await toolbox.destroy();

  info("Re-opening the layout view.");
  let { boxmodel } = await openLayoutView();
  let { document: doc } = boxmodel;
  let bContent = doc.querySelector("#layout-container .box-model-pane ._content");

  info("Checking the state of the box model panel.");
  ok(!bContent, "The box model panel content is not rendered.");
  ok(!Services.prefs.getBoolPref(BOXMODEL_OPENED_PREF),
    `${BOXMODEL_OPENED_PREF} is pref off.`);
}
