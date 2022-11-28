/* eslint-disable camelcase */
// [0]? [1]bid[0] = 38[1]
const url = location.search;
const uid = url.split("?")[1].split("=")[1];

let wpage = 0;
const wcount = 5;

let cpage = 0;
const ccount = 5;

sessionStorage.setItem("id", 4);
sessionStorage.setItem("name", "4");
sessionStorage.setItem("nick", "4");

function getProfile(userId, getId, callback) {
  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    if (xhr.status === 200) {
      // 아래의 내용 추가
      const response = JSON.parse(xhr.responseText); // 결과값 JSON으로

      const nick = document.getElementById("nick"); // nick DOM 받음
      nick.innerText = response.info.nick; // response에 넣음

      const follower = document.getElementById("follower-count"); // follower DOM 받음
      follower.innerText = new Intl.NumberFormat("ko-KR", {
        notation: "compact",
      }).format(Number(response.info.follower)); // Intl을 이용하여 사용자가 보기 좋은 형태로 변환

      const following = document.getElementById("following-count"); // following DOM 받음
      following.innerText = new Intl.NumberFormat("en-US", {
        notation: "compact",
      }).format(Number(response.info.following)); // Intl을 이용하여 사용자가 보기 좋은 형태로 변환

      const folBtn = document.getElementsByClassName("profile-content-btn")[0]; // 팔로우 버튼의 큰 틀 가지고 옴
      const folSpan = document.getElementsByClassName("profile-content-btn")[0] // 팔로우 버튼의 글자 가지고 옴
        .children[0];
      if (uid === getId) {
        // 본인이 본인 프로필 조회 할 때
        folBtn.style.display = "none"; // 본인 일 때에는 안보이게 처리
      }
      if (response.isFollow === true) {
        // 본인이 팔로우 한 사람을 조회 할 때
        folSpan.innerText = "팔로우 중";
        folBtn.addEventListener("click", unfollow); // 이벤트 추가 (아래의 코드 참고)
      } else {
        folSpan.innerText = "팔로우"; // 본인이 팔로우 하지 않은 사람을 조회 할 때
        folBtn.addEventListener("click", follow); // 이벤트 추가 (아래의 코드 참고)
      }

      callback();
    }
  };

  xhr.onerror = () => {
    console.error(xhr.responseText);
  };

  xhr.open("GET", `http://localhost:3000/profile/get/${uid}?getId=${getId}`);
  xhr.send();
}

function follow() {
  const xhr2 = new XMLHttpRequest();
  const data = {
    follower: uid, // body값으로 follower => 프로필 조회한 페이지 Id
    following: sessionStorage.getItem("id"), // following -> 내 고유 id
  };

  xhr2.onload = () => {
    if (xhr2.status === 200) {
      const folBtn = document.getElementsByClassName("profile-content-btn")[0]; // 버튼 DOM 받아옴
      folBtn.removeEventListener("click", follow); // 기존 이벤트 삭제
      folBtn.addEventListener("click", unfollow); // 새로운 이벤트 추가
      const folSpan = document.getElementsByClassName("profile-content-btn")[0]
        .children[0]; // 버튼 Span DOM 받아옴
      folSpan.innerText = "팔로우 중"; // 버튼 글자 변경
    }
  };

  xhr2.onerror = () => {
    console.error(xhr2.responseText);
  };

  xhr2.open("POST", `http://localhost:3000/profile/follow`);
  xhr2.setRequestHeader("Content-Type", "application/json");
  xhr2.send(JSON.stringify(data));
}
function unfollow() {
  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    const folBtn = document.getElementsByClassName("profile-content-btn")[0]; // 버튼 DOM 받아옴
    folBtn.removeEventListener("click", unfollow); // 기존 이벤트 삭제
    folBtn.addEventListener("click", follow); // 새로운 이벤트 추가
    const folSpan = document.getElementsByClassName("profile-content-btn")[0]
      .children[0];
    folSpan.innerText = "팔로우"; // 글 변경
  };

  xhr.onerror = () => {
    console.error(xhr.responseText);
  };

  xhr.open(
    "DELETE",
    `http://localhost:3000/profile/unfollow?follower=${uid}&following=${sessionStorage.getItem(
      "id"
    )}`
  );
  xhr.send();
}

function getWriteCount(userId, callback) {
  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      callback(response); // 응답값을 바로 callback으로 넘김
    }
  };

  xhr.onerror = () => {
    console.error(xhr.responseText);
  };

  xhr.open("GET", `http://localhost:3000/board/get/count/${uid}`);
  xhr.send();
}
function getCommCount(userId, callback) {
  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      callback(response);
    }
  };

  xhr.onerror = () => {
    console.error(xhr.responseText);
  };

  xhr.open("GET", `http://localhost:3000/comment/get/count/${uid}`);
  xhr.send();
}
getProfile(sessionStorage.getItem("id"), sessionStorage.getItem("id"), () => {
  getWriteCount(uid, (response) => {
    const writeCount = document.getElementById("write-count");
    writeCount.innerText = new Intl.NumberFormat("en-US", {
      notation: "compact",
    }).format(Number(response.count));
    getCommCount(uid, (response2) => {
      const commCount = document.getElementById("comm-count");
      commCount.innerText = new Intl.NumberFormat("en-US", {
        notation: "compact",
      }).format(Number(response2.count));
    });
  });
});

function getWrite(userId, callback) {
  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      wpage += 1; // 페이지 1 추가
      callback(response); // 결과값 바로 콜백
    }
  };

  xhr.onerror = () => {
    console.error(xhr.responseText);
  };

  xhr.open(
    "GET",
    `http://localhost:3000/board/get/${uid}?page=${wpage}&count=${wcount}`
  );
  xhr.send();
}
function makeBoard(bid, nick, date, content, sort = "DESC") {
  const div1 = document.createElement("div");
  div1.className = "board-content";

  const div1_1 = document.createElement("div");
  div1_1.className = "content-top";
  const span1_1 = document.createElement("span");
  span1_1.innerText = nick;
  const span1_2 = document.createElement("span");
  span1_2.innerText = date;
  div1_1.append(span1_1, span1_2);

  const div1_2 = document.createElement("div");
  div1_2.className = "content-middle";
  const span1_2_1 = document.createElement("span");
  span1_2_1.innerText = content;
  div1_2.append(span1_2_1);

  const div1_3 = document.createElement("div");
  div1_3.className = "comment-container";
  const div1_3_1 = document.createElement("div");
  div1_3_1.className = "submit-btn";
  div1_3_1.id = "comment-btn";
  const span1_3_1_1 = document.createElement("span");
  span1_3_1_1.innerText = "댓글 보기";
  div1_3_1.append(span1_3_1_1);

  div1_3_1.addEventListener("click", () => {
    location.href = `http://localhost:3000/detail.html?bid=${bid}`;
  });

  div1_3.append(div1_3_1);

  div1.append(div1_1, div1_2, div1_3);

  if (sort === "ASC") {
    // 해당 부분 클래스 이름 수정
    document.getElementsByClassName("profile-bottom")[0].prepend(div1);
  } else if (sort === "DESC") {
    // 해당 부분 클래스 이름 수정
    document.getElementsByClassName("profile-bottom")[0].append(div1);
  }
}
function getTime(date) {
  const dt = new Date(date);
  const year = dt.getFullYear();
  const month = `0${dt.getMonth() + 1}`.slice(-2);
  const day = `0${dt.getDate()}`.slice(-2);
  const hh = `0${dt.getHours()}`.slice(-2);
  const mm = `0${dt.getMinutes()}`.slice(-2);

  // 입력 받은 시간의 UNIX Timestamp
  dt.getTime();

  // 현재 시간의 UNIX Timestamp
  const now = new Date();

  const pass = now.getTime() - dt.getTime();

  let val = "";
  switch (true) {
    case pass >= 31536000000:
      val = `${Math.floor(pass / 31536000000)}년 전`;
      break;

    case pass >= 2592000000:
      val = `${Math.floor(pass / 2592000000)}월 전`;
      break;

    case pass >= 86400000:
      val = `${Math.floor(pass / 86400000)}일 전`;
      break;

    case pass >= 3600000:
      val = `${Math.floor(pass / 3600000)}시간 전`;
      break;

    case pass >= 60000:
      val = `${Math.floor(pass / 60000)}분 전`;
      break;

    default:
      console.log("default");
      val = "0분 전";
      break;
  }

  return `${year}-${month}-${day} ${hh}:${mm} (${val})`;
}

const write = document.getElementById("write"); // write DOM 받
write.addEventListener("click", () => {
  wpage = 0;
  const bottom = document.getElementsByClassName("profile-bottom")[0];
  for (let i = bottom.children.length; i > 0; i -= 1) {
    bottom.children[0].remove();
  }
  getWrite(uid, (response) => {
    response.content.forEach((element) => {
      makeBoard(
        element.bid,
        element.nick,
        getTime(element.date),
        element.content
      );
    });
  });
});
