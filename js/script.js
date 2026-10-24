(function(){
  function load(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function save(k,v){try{localStorage.setItem(k,v)}catch(e){}}

  // 탭
  var tabs=["plan","entry","food","shop","grab","money","hotel","care","esim"];
  function go(t,scroll){
    if(tabs.indexOf(t)<0)t="plan";
    tabs.forEach(function(x){document.getElementById(x).classList.toggle("on",x===t)});
    document.querySelectorAll("nav button").forEach(function(b){b.setAttribute("aria-current",b.dataset.tab===t?"true":"false")});
    if(scroll!==false)window.scrollTo(0,0);
  }
  document.querySelectorAll("nav button").forEach(function(b){b.addEventListener("click",function(){go(b.dataset.tab)})});
  go((location.hash||"").replace("#",""),false);
  document.querySelectorAll("[data-go]").forEach(function(b){b.addEventListener("click",function(){go(b.dataset.go)})});

  // 날짜 고르기
  var days=[].slice.call(document.querySelectorAll(".day")), picks=[].slice.call(document.querySelectorAll(".daypick button"));
  function showDay(i,scroll){
    days.forEach(function(d){d.classList.toggle("show",+d.dataset.i===i)});
    picks.forEach(function(p){p.setAttribute("aria-selected",+p.dataset.i===i?"true":"false")});
    days.forEach(function(d){d.querySelector(".prev").disabled=(+d.dataset.i===0);d.querySelector(".next").disabled=(+d.dataset.i===days.length-1)});
    if(scroll)document.querySelector(".daypick").scrollIntoView({block:"start"});
  }
  picks.forEach(function(p){p.addEventListener("click",function(){showDay(+p.dataset.i,false)})});
  days.forEach(function(d){
    d.querySelector(".prev").addEventListener("click",function(){showDay(+d.dataset.i-1,true)});
    d.querySelector(".next").addEventListener("click",function(){showDay(+d.dataset.i+1,true)});
  });
  var d=new Date(), key=("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2), start=0;
  days.forEach(function(x){if(x.dataset.date===key){start=+x.dataset.i;
    var pk=picks[start];pk.classList.add("is-today");
    var t=document.createElement("span");t.className="today";t.textContent="오늘";x.querySelector(".when").appendChild(t);}});
  showDay(start,false);

  // 편지
  var LW={"1":[Date.UTC(2026,9,29,14,0),Date.UTC(2026,10,1,15,0)],"2":[Date.UTC(2026,10,1,20,30),Date.UTC(2026,10,20)]};
  var lbg=document.getElementById("letterBg"), lcl=document.getElementById("letterClose"), lprev=null, lcur=null;
  var env=document.getElementById("env"), envWrap=document.getElementById("envWrap"), card=document.getElementById("letterCard");
  var calm=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function openLetter(k,mark){
    lprev=document.activeElement; lcur=mark?k:null;
    document.getElementById("lt1").hidden=(k!=="1"); document.getElementById("lt2").hidden=(k!=="2");
    env.classList.remove("open"); envWrap.hidden=false; card.hidden=true; card.classList.remove("show");
    lbg.hidden=false; env.focus();
  }
  var opening=false;
  function unfold(){
    if(opening)return; opening=true;
    env.classList.add("open");
    setTimeout(function(){envWrap.hidden=true; card.hidden=false; requestAnimationFrame(function(){card.classList.add("show")}); lcl.focus(); opening=false;}, calm?0:1500);
  }
  env.addEventListener("click",unfold);
  env.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();unfold()}});
  function closeLetter(){lbg.hidden=true; if(lcur)save("letter"+lcur,"1"); if(lprev&&lprev.focus)lprev.focus();}
  lcl.addEventListener("click",closeLetter);
  lbg.addEventListener("click",function(e){if(e.target===lbg&&!card.hidden)closeLetter()});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!lbg.hidden)closeLetter()});
  var now=Date.now();
  var hk=(location.hash||"").replace("#","");
  if(hk==="letter1")openLetter("1",false);
  else if(hk==="letter2")openLetter("2",false);
  else{["2","1"].some(function(k){if(now>=LW[k][0]&&now<LW[k][1]&&!load("letter"+k)){openLetter(k,true);return true}return false});}

  // 호텔 이름 (두 칸 연동)
  var DEF="Sheraton Cebu Mactan Resort";
  var saved=load("hotel_en");
  var val=(saved&&!/[\uAC00-\uD7A3]/.test(saved))?saved:DEF;
  var ins=document.querySelectorAll(".hotel-in");
  ins.forEach(function(i){
    i.value=val;
    i.addEventListener("input",function(){save("hotel_en",i.value);ins.forEach(function(o){if(o!==i)o.value=i.value})});
  });
  document.querySelectorAll(".copy").forEach(function(btn){
    var box=btn.parentNode, input=box.querySelector("input"), msg=box.querySelector(".msg");
    btn.addEventListener("click",function(){
      var v=input.value.trim();
      if(!v){msg.textContent="호텔 이름을 먼저 적어 주세요.";input.focus();return}
      var ok="복사했어요. 그랩 앱에서 꾹 눌러 붙여넣으세요.";
      function fb(){input.focus();input.select();try{document.execCommand("copy");msg.textContent=ok}catch(e){msg.textContent="이름이 선택됐어요. 꾹 눌러 ‘복사’를 누르세요."}}
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(v).then(function(){msg.textContent=ok},fb);else fb();
    });
  });

  // 가이드 전화
  var g=document.getElementById("guide"), cg=document.getElementById("callGuide"), gm=document.getElementById("guideMsg");
  g.value=load("guide")||"";
  function paint(){var n=g.value.replace(/[^0-9+]/g,"");cg.href=n?"tel:"+n:"#"}
  paint();
  g.addEventListener("input",function(){save("guide",g.value);gm.textContent="";paint()});
  cg.addEventListener("click",function(e){if(cg.getAttribute("href")==="#"){e.preventDefault();gm.textContent="가이드 전화번호를 먼저 적어 주세요.";g.focus()}});
})();
