/* TOEIC Part 6 BEAT — original practice corpus.
   16 document blueprints × 5 contextual variants = 80 documents / 320 questions. */
(() => {
  const V = [
    {company:'Northstar',person:'Ms. Chen',city:'Osaka',product:'Aero Desk',date:'October 12',event:'Innovation Forum'},
    {company:'Greenfield',person:'Mr. Ortiz',city:'Kobe',product:'Pure Bottle',date:'November 3',event:'Design Workshop'},
    {company:'Harbor & Co.',person:'Ms. Patel',city:'Kyoto',product:'Flex Lamp',date:'December 8',event:'Retail Summit'},
    {company:'Brightline',person:'Mr. Kim',city:'Nagoya',product:'Cloud Stand',date:'January 16',event:'Career Fair'},
    {company:'Summit Works',person:'Ms. Davis',city:'Tokyo',product:'Metro Bag',date:'February 21',event:'Leadership Seminar'}
  ];
  const q=(type,options,answer,explanation,others='他の選択肢は、品詞・意味・前後関係のいずれかがこの文脈に合いません。')=>({type,options,answer,explanation,others});
  const blueprints=[
    v=>({type:'CUSTOMER E-MAIL',title:`Update on your ${v.product} order`,body:`Dear ${v.person},\n\nThank you for ordering the ${v.product}. Demand has been much higher than we {{0}}, so the item will leave our warehouse two days later than planned. {{1}} We have upgraded your delivery to express service at no additional {{2}}. You will receive a tracking number as soon as the package {{3}}.\n\nSincerely,\n${v.company} Customer Care`,questions:[
      q('語彙・時制',['anticipate','anticipated','are anticipating','will anticipate'],1,'過去に立てた予測を表すため、過去形 anticipated が自然です。'),
      q('一文挿入',['We apologize for the inconvenience this delay may cause.','The warehouse was painted blue last year.','Please order a different product immediately.','Our office has five meeting rooms.'],0,'遅延の説明と、次の補償対応を自然につなぐ謝罪文です。'),
      q('コロケーション',['cost','expense','pricey','paying'],0,'at no additional cost（追加費用なし）が定型表現です。'),
      q('文法・態',['ships','will ship','is shipped','shipping'],2,'package は発送される側なので受動態 is shipped が必要です。')]}),
    v=>({type:'INTERNAL MEMO',title:`Relocation to the ${v.city} office`,body:`To: All Sales Staff\nFrom: Operations\n\nOur sales division will move to the renovated ${v.city} office on ${v.date}. Employees should pack personal items by Friday and label every box {{0}}. The facilities team will transport all office equipment. {{1}} Staff members who need access to client records during the move should save the files to the secure server {{2}} Thursday evening. Normal operations are expected to {{3}} on Monday.`,questions:[
      q('語彙・副詞',['clear','clearly','clearness','clearing'],1,'動詞 label を修飾する副詞 clearly が適切です。'),
      q('一文挿入',['Computers should remain connected until the end of the workday.','The company picnic was popular last summer.','Several clients prefer printed advertisements.','The elevator is inspected every month.'],0,'梱包の指示に続き、機器の扱いを具体化する文です。'),
      q('前置詞',['by','among','beside','throughout'],0,'締切を表す by Thursday evening が適切です。'),
      q('語彙',['resume','retire','remove','reserve'],0,'operations resume（業務が再開する）が文脈に合います。')]}),
    v=>({type:'EVENT NOTICE',title:v.event,body:`Registration is now open for the ${v.event}, to be held in ${v.city} on ${v.date}. This year's program features talks by industry leaders and small-group sessions designed to be highly {{0}}. Because seating is limited, participants are encouraged to register {{1}}. {{2}} A complete schedule will be sent to registered guests one week before the event. Requests for dietary accommodations must {{3}} with the registration form.`,questions:[
      q('品詞',['interact','interaction','interactive','interactively'],2,'be の補語には形容詞 interactive が入ります。'),
      q('語彙・副詞',['early','nearly','rarely','lately'],0,'席数が限られるため早めの登録を促す流れです。'),
      q('一文挿入',['The fee includes lunch and all workshop materials.','The building was once a train station.','Speakers travel for many reasons.','The menu changes every morning.'],0,'参加登録に関する案内から日程案内へ自然につながる追加情報です。'),
      q('文法・態',['submit','be submitted','submitting','have submitted'],1,'requests は提出されるものなので must be submitted が適切です。')]}),
    v=>({type:'ADVERTISEMENT',title:`Meet the new ${v.product}`,body:`The ${v.product} was created for professionals who want a workspace that adapts to them. Its height can be adjusted in seconds, {{0}} users to alternate between sitting and standing. The surface is both durable and easy to clean. {{1}} For a limited time, customers who purchase directly from ${v.company} will receive free delivery and assembly. This offer is {{2}} through ${v.date} and cannot be combined with other {{3}}.`,questions:[
      q('文法・分詞',['allow','allows','allowed','allowing'],3,'前文全体の結果を補足する分詞構文 allowing が自然です。'),
      q('一文挿入',['It is available in three finishes to suit different interiors.','Office workers take trains at different times.','The factory closes at six o’clock.','Many people read product reviews.'],0,'製品特徴の列挙として色・仕上げの情報が自然に続きます。'),
      q('語彙',['valid','accurate','capable','steady'],0,'offer is valid through ...（特典は〜まで有効）が適切です。'),
      q('コロケーション',['promotions','promoters','promoting','promotional'],0,'other promotions（他の販促特典）という名詞が必要です。')]}),
    v=>({type:'SERVICE ANNOUNCEMENT',title:`Scheduled system maintenance`,body:`The ${v.company} member portal will be temporarily unavailable from 1:00 A.M. to 4:00 A.M. on ${v.date} while we perform routine maintenance. During this period, users will not be able to view invoices {{0}} update account details. {{1}} We selected these hours because portal activity is typically at its {{2}}. If the work is completed ahead of schedule, access will be restored {{3}}.`,questions:[
      q('接続詞',['or','but','so','yet'],0,'not be able to A or B で、利用できない2機能を並列します。'),
      q('一文挿入',['We recommend completing urgent transactions in advance.','Most invoices contain a company logo.','The support team enjoys early meetings.','Passwords should contain several letters.'],0,'利用停止の説明を受けた利用者への実用的な案内です。'),
      q('語彙・最上級',['low','lower','lowest','lowly'],2,'at its lowest（最も低い状態で）が定型的かつ文脈に合います。'),
      q('副詞',['promptly','prompt','promptness','prompting'],0,'動詞 restored を修飾する副詞 promptly が必要です。')]}),
    v=>({type:'HR E-MAIL',title:`Welcome to ${v.company}`,body:`Dear ${v.person},\n\nWe are pleased that you have accepted our offer to join the marketing team. Your first day will be ${v.date}. Please report to reception at 9:00 A.M., where a staff member will issue your security badge and {{0}} you to your desk. {{1}} Your supervisor has also arranged a team lunch so that you can become {{2}} with your colleagues. If you have any questions beforehand, please do not {{3}} to contact me.`,questions:[
      q('語彙',['escort','extend','export','estimate'],0,'escort 人 to 場所（人を場所まで案内する）が適切です。'),
      q('一文挿入',['A brief orientation will begin shortly afterward.','The reception desk was purchased recently.','Lunch is served in several nearby cafés.','Marketing materials use many colors.'],0,'初日の受付手続きの次にオリエンテーションが続く流れです。'),
      q('コロケーション',['familiar','similar','popular','regular'],0,'become familiar with（〜に慣れ親しむ）が定型表現です。'),
      q('語彙',['hesitate','prevent','delay','refuse'],0,'do not hesitate to contact（遠慮なく連絡する）が定型表現です。')]}),
    v=>({type:'NEWSLETTER',title:`${v.city} branch achieves record results`,body:`The ${v.city} branch reported its strongest quarterly sales since it opened. Branch manager ${v.person} credited the result to a renewed focus on customer follow-up. Team members contacted clients within 24 hours of each inquiry, {{0}} the average response time by nearly half. {{1}} The branch also introduced weekly coaching sessions, which employees described as practical and {{2}}. Management plans to adopt several of these methods at other locations {{3}} the next quarter.`,questions:[
      q('文法・分詞',['reduce','reduced','reducing','reduction'],2,'前文の結果を示す分詞構文 reducing が自然です。'),
      q('一文挿入',['This practice led to a noticeable increase in completed orders.','The branch occupies the third floor.','Some employees commute by bicycle.','The city has several public parks.'],0,'迅速なフォローの結果として受注が増えたという因果関係が自然です。'),
      q('語彙',['effective','vacant','temporary','narrow'],0,'coaching sessions の肯定的評価として practical and effective が自然です。'),
      q('前置詞',['during','between','except','beneath'],0,'期間を表す during the next quarter が適切です。')]}),
    v=>({type:'RESERVATION NOTICE',title:`Your reservation has been updated`,body:`This message confirms that your reservation at the ${v.city} Conference Center has been changed to ${v.date}. The meeting room will be available from 2:00 P.M. {{0}} 6:00 P.M. and can accommodate up to 30 guests. {{1}} Please review the attached floor plan and notify us within two business days if the revised arrangement is not {{2}}. Unless we hear from you, the update will be considered {{3}}.`,questions:[
      q('前置詞',['until','among','beside','despite'],0,'from 2:00 P.M. until 6:00 P.M. で時間範囲を示します。'),
      q('一文挿入',['Your requested audiovisual equipment is included in the booking.','The center opened more than ten years ago.','Several buses stop near the building.','Guests often exchange business cards.'],0,'予約内容の確認として、設備が含まれることを伝える文が自然です。'),
      q('語彙',['suitable','visible','ordinary','frequent'],0,'revised arrangement が目的に適しているかを尋ねるため suitable が適切です。'),
      q('語彙・態',['confirm','confirmed','confirming','confirmation'],1,'be considered confirmed（確定したとみなす）が適切です。')]}),
    v=>({type:'POLICY MEMO',title:`Revised expense-report policy`,body:`Beginning ${v.date}, employees must submit travel expenses within ten business days of returning from a trip. Receipts should be uploaded as clear digital images; paper copies are no longer {{0}}. Managers are responsible for reviewing each report before it is sent to Accounting. {{1}} Reports containing incomplete information will be returned to the employee, which may {{2}} reimbursement. The revised policy is intended to make processing more consistent and {{3}}.`,questions:[
      q('語彙・態',['require','required','requiring','requirement'],1,'paper copies are no longer required（不要になった）が適切です。'),
      q('一文挿入',['This review must be completed within three business days.','The Accounting office has large windows.','Business trips often involve train travel.','Managers attend an annual conference.'],0,'manager の review という直前の内容を受け、その期限を示しています。'),
      q('語彙',['delay','display','divide','deliver'],0,'不備が払い戻しを遅らせるという意味で delay が適切です。'),
      q('品詞',['efficient','efficiency','efficiently','efficiencies'],0,'make processing consistent and efficient と形容詞を並列します。')]}),
    v=>({type:'WEBSITE ARTICLE',title:`A smarter way to plan your visit`,body:`Visitors to ${v.city} can now use a new online tool to create personalized travel plans. After users select their interests and available time, the tool recommends attractions and places them in a logical order. Routes are adjusted {{0}} current opening hours and travel times. {{1}} The service is free, and no account is required unless users want to save a plan for {{2}} use. Local tourism officials expect the tool to help travelers spend less time organizing and more time {{3}} the city.`,questions:[
      q('前置詞句',['according to','apart from','instead of','owing'],0,'current information に基づき調整するため according to が適切です。'),
      q('一文挿入',['Users can also remove or rearrange any suggested stop.','The city hall closes on national holidays.','Many attractions sell postcards.','Travelers carry bags of different sizes.'],0,'旅行プランのカスタマイズ機能の説明として自然に続きます。'),
      q('形容詞',['later','late','latest','latter'],0,'later use（後で使うため）が自然です。'),
      q('動名詞',['explore','explored','exploring','exploration'],2,'spend time doing の形なので exploring が必要です。')]}),
    v=>({type:'SUPPLIER LETTER',title:`Changes to our delivery schedule`,body:`Dear Business Partner,\n\nDue to road construction near our distribution center, deliveries scheduled for ${v.date} may arrive later than usual. We are working with our drivers to minimize disruption and will provide updated arrival estimates {{0}} they become available. {{1}} Orders that contain temperature-sensitive goods will be given the highest {{2}}. We appreciate your patience while we make every {{3}} to maintain reliable service.`,questions:[
      q('接続詞',['as soon as','even though','unless','whereas'],0,'情報が利用可能になり次第、という時間関係を表します。'),
      q('一文挿入',['Customers do not need to contact us unless an order is urgent.','Roads are used by many kinds of vehicles.','Our center employs more than fifty people.','The weather was pleasant last week.'],0,'遅延案内を受けた顧客が取るべき行動を明確にしています。'),
      q('コロケーション',['priority','majority','authority','facility'],0,'give ... the highest priority（最優先する）が定型表現です。'),
      q('コロケーション',['effort','effect','affair','offer'],0,'make every effort to（あらゆる努力をする）が定型表現です。')]}),
    v=>({type:'JOB POSTING',title:`Project coordinator wanted`,body:`${v.company} is seeking a project coordinator for its growing ${v.city} team. The successful candidate will track schedules, prepare client updates, and ensure that project records remain {{0}}. Applicants should have at least two years of administrative experience and be comfortable working with multiple deadlines. {{1}} Experience with budgeting software is preferred but not {{2}}. Applications received by ${v.date} will be given full {{3}}.`,questions:[
      q('語彙',['accurate','fortunate','available','generous'],0,'records remain accurate（記録が正確に保たれる）が適切です。'),
      q('一文挿入',['Strong written communication skills are essential for this role.','The office kitchen has a new refrigerator.','Clients sometimes visit from overseas.','The building has two entrances.'],0,'職務内容に直結する応募条件を追加する文です。'),
      q('語彙',['required','persuaded','attached','occupied'],0,'preferred but not required（望ましいが必須ではない）が定型です。'),
      q('コロケーション',['consideration','conversation','concentration','construction'],0,'be given full consideration（十分に検討される）が適切です。')]}),
    v=>({type:'SURVEY REQUEST',title:`Tell us about your experience`,body:`You recently contacted ${v.company} for technical support. To help us improve, we invite you to complete a short survey about the service you received. The survey contains six questions and should take {{0}} than three minutes. Your responses will be combined with those of other customers and reviewed in summary form. {{1}} As a thank-you, everyone who completes the survey by ${v.date} will be entered into a drawing {{2}} a ${v.product}. We value your opinion and look forward to {{3}} from you.`,questions:[
      q('比較表現',['few','fewer','little','less'],3,'時間の量には less than three minutes を使います。'),
      q('一文挿入',['Individual responses will not be shared with support agents.','Support agents use several computer screens.','Our products are sold in many stores.','The survey was designed on a Tuesday.'],0,'回答の扱いを説明する段落なので、プライバシー情報が自然です。'),
      q('前置詞',['for','with','at','over'],0,'a drawing for a prize（賞品が当たる抽選）が適切です。'),
      q('動名詞',['hear','heard','hearing','have heard'],2,'look forward to の to は前置詞なので動名詞 hearing が必要です。')]}),
    v=>({type:'PRESS RELEASE',title:`${v.company} opens new training center`,body:`${v.company} today announced the opening of a training center in ${v.city}. The facility includes three classrooms and a simulation area where employees can practice responding to realistic customer situations. Courses will initially be offered to new staff members and later {{0}} to experienced employees. {{1}} According to ${v.person}, the center will allow the company to provide training more {{2}} across all departments. The first classes are scheduled to {{3}} on ${v.date}.`,questions:[
      q('文法・態',['extend','extended','be extended','extending'],2,'courses は対象を広げられる側なので be extended が適切です。'),
      q('一文挿入',['The program was developed after managers identified gaps in existing instruction.','The facility is located near a popular bakery.','New employees receive identification cards.','Classrooms contain chairs and tables.'],0,'施設設立の背景を説明し、次の効果説明につなげます。'),
      q('副詞',['consistent','consistency','consistently','consist'],2,'provide training を修飾する副詞 consistently が必要です。'),
      q('語彙',['begin','arise','achieve','attend'],0,'classes begin（授業が始まる）が自然です。')]}),
    v=>({type:'BUILDING NOTICE',title:`Lobby renovation`,body:`Renovation of the main lobby will begin on ${v.date} and continue for approximately three weeks. During construction, visitors should enter through the east doors, which are located {{0}} the parking area. Directional signs will be posted throughout the building. {{1}} Contractors will perform the noisiest work before 9:00 A.M. to avoid {{2}} scheduled meetings. We thank tenants for their cooperation and regret any inconvenience the project may {{3}}.`,questions:[
      q('前置詞',['beside','during','among','through'],0,'駐車場のそばという位置関係を表す beside が適切です。'),
      q('一文挿入',['Reception staff will temporarily work at a desk near that entrance.','The lobby furniture was selected by a designer.','Parking spaces are painted with white lines.','Meetings vary greatly in length.'],0,'臨時入口の案内を具体化する情報です。'),
      q('動名詞',['interrupt','interrupted','interrupting','interruption'],2,'avoid の目的語には動名詞 interrupting が必要です。'),
      q('語彙',['cause','cause to','causing','caused'],0,'may の後は動詞原形 cause が必要です。')]}),
    v=>({type:'FOLLOW-UP E-MAIL',title:`Thank you for attending ${v.event}`,body:`Thank you for joining us at the ${v.event} in ${v.city}. We hope the sessions provided ideas that you can apply in your work. Presentation slides are now available on the attendee website and may be downloaded {{0}} ${v.date}. {{1}} We would also appreciate your feedback through the online evaluation form. Responses are anonymous and will be used {{2}} next year's program. We hope to {{3}} you again at a future event.`,questions:[
      q('前置詞',['until','along','except','toward'],0,'ダウンロード可能な期限を示す until が適切です。'),
      q('一文挿入',['Use the access code printed on your name badge to sign in.','Name badges were available in several colors.','Some presenters traveled by train.','The website was viewed yesterday.'],0,'attendee website への具体的なアクセス方法を示しています。'),
      q('不定詞',['improve','improved','to improve','improving'],2,'目的を表す be used to improve が適切です。'),
      q('語彙',['welcome','arrive','participate','belong'],0,'主催者が参加者を再び迎える意味で welcome が自然です。')]}),
  ];

  const documents=[];
  let docNo=0;
  blueprints.forEach((make,b)=>V.forEach((variant,vIndex)=>{
    const d=make(variant); docNo++;
    const band=docNo<=15?'600–699':docNo<=40?'700–799':'800–900';
    const numeric=docNo<=15?650:docNo<=40?750:850;
    d.id=`D${String(docNo).padStart(3,'0')}`; d.difficulty=band; d.level=numeric;
    // Rotate choices deterministically so correct letters remain evenly distributed.
    d.questions=d.questions.map((item,i)=>{const target=(docNo+i)%4,shift=(item.answer-target+4)%4;const options=item.options.map((_,n)=>item.options[(n+shift)%4]);return{...item,options,answer:target,id:`${d.id}-Q${i+1}`}});
    documents.push(d);
  }));
  window.PART6_DATA={version:'1.0.0',documents};
})();
