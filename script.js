function openTab(evt, tabName){
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for(i=0;i<tabcontent.length;i++){ tabcontent[i].style.display="none"; }
  tablinks = document.getElementsByClassName("tablinks");
  for(i=0;i<tablinks.length;i++){ tablinks[i].className = tablinks[i].className.replace(" active",""); }
  document.getElementById(tabName).style.display="block";
  evt.currentTarget.className += " active";
}
function showStatus(id,msg,type){
  const el=document.getElementById(id);
  el.innerText=msg;
  el.className='status '+type;
  el.style.display='block';
  setTimeout(()=>{ el.style.display='none'; },4000);
}

// PDF → Word
async function pdfToWord(){
  const input=document.getElementById("pdfToWordFile");
  if(!input.files.length){ showStatus("pdfWordStatus","Select PDF first!","error"); return; }
  const file=input.files[0];
  const arrayBuffer=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:arrayBuffer}).promise;
  let fullText="";
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i);
    const content=await page.getTextContent();
    fullText+=content.items.map(item=>item.str).join(" ")+"\n\n";
  }
  const { Document, Packer, Paragraph, TextRun }=window.docx;
  const doc=new Document({sections:[{properties:{},children:[new Paragraph({children:[new TextRun(fullText)])}]}]});
  const blob=await Packer.toBlob(doc);
  saveAs(blob,"converted.docx");
  showStatus("pdfWordStatus","PDF converted to Word!","success");
}

// Word → PDF
async function wordToPdf(){
  const input=document.getElementById("wordToPdfFile");
  if(!input.files.length){ showStatus("wordPdfStatus","Select Word file!","error"); return; }
  const file=input.files[0];
  const reader=new FileReader();
  reader.onload=function(e){
    const arrayBuffer=e.target.result;
    const { jsPDF }=window.jspdf;
    const pdfDoc=new jsPDF();
    const textDecoder=new TextDecoder("utf-8");
    const text=textDecoder.decode(arrayBuffer);
    pdfDoc.text(text,10,10);
    pdfDoc.save("converted.pdf");
    showStatus("wordPdfStatus","Word converted to PDF!","success");
  };
  reader.readAsArrayBuffer(file);
}

// PDF → JPG
async function pdfToJpg(){
  const input=document.getElementById("pdfToJpgFile");
  if(!input.files.length){ showStatus("pdfJpgStatus","Select PDF!","error"); return; }
  const file=input.files[0];
  const arrayBuffer=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data: arrayBuffer}).promise;
  const canvas=document.createElement("canvas");
  const ctx=canvas.getContext("2d");
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i);
    const viewport=page.getViewport({scale:2});
    canvas.width=viewport.width; canvas.height=viewport.height;
    await page.render({canvasContext:ctx, viewport:viewport}).promise;
    canvas.toBlob(blob=>{ saveAs(blob, `page_${i}.jpg`); },'image/jpeg',0.95);
  }
  showStatus("pdfJpgStatus","PDF converted to JPG!","success");
}

// JPG → PDF
async function jpgToPdf(){
  const input=document.getElementById("jpgToPdfFile");
  if(!input.files.length){ showStatus("jpgPdfStatus","Select JPG(s)!","error"); return; }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  for(let i=0;i<input.files.length;i++){
    const file=input.files[i];
    const imgData = await fileToDataURL(file);
    pdf.addImage(imgData,'JPEG',10,10,180,0);
    if(i<input.files.length-1) pdf.addPage();
  }
  pdf.save("converted.pdf");
  showStatus("jpgPdfStatus","JPG(s) converted to PDF!","success");
}

function fileToDataURL(file){
  return new Promise(resolve=>{
    const reader=new FileReader();
    reader.onload=e=>resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Merge / Split / Compress (placeholder)
function mergeSplitPdf(){ showStatus("mergeSplitStatus","Merge function not implemented yet.","error"); }
function splitPdf(){ showStatus("mergeSplitStatus","Split function not implemented yet.","error"); }
function compressPdf(){ showStatus("compressStatus","Compress function not implemented yet.","error"); }
