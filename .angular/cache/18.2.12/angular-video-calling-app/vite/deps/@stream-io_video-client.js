import {
  AxiosError,
  axios_default
} from "./chunk-ZPSVKX3J.js";
import {
  BehaviorSubject,
  ReplaySubject,
  combineLatest,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  from,
  fromEvent,
  fromEventPattern,
  map,
  merge,
  of,
  pairwise,
  shareReplay,
  startWith,
  takeWhile
} from "./chunk-U5KJRNBN.js";
import {
  __async,
  __commonJS,
  __export,
  __objRest,
  __restKey,
  __spreadProps,
  __spreadValues,
  __toESM
} from "./chunk-GGVGRBKZ.js";

// node_modules/sdp/sdp.js
var require_sdp = __commonJS({
  "node_modules/sdp/sdp.js"(exports, module) {
    "use strict";
    var SDPUtils2 = {};
    SDPUtils2.generateIdentifier = function() {
      return Math.random().toString(36).substring(2, 12);
    };
    SDPUtils2.localCName = SDPUtils2.generateIdentifier();
    SDPUtils2.splitLines = function(blob) {
      return blob.trim().split("\n").map((line) => line.trim());
    };
    SDPUtils2.splitSections = function(blob) {
      const parts = blob.split("\nm=");
      return parts.map((part, index) => (index > 0 ? "m=" + part : part).trim() + "\r\n");
    };
    SDPUtils2.getDescription = function(blob) {
      const sections = SDPUtils2.splitSections(blob);
      return sections && sections[0];
    };
    SDPUtils2.getMediaSections = function(blob) {
      const sections = SDPUtils2.splitSections(blob);
      sections.shift();
      return sections;
    };
    SDPUtils2.matchPrefix = function(blob, prefix) {
      return SDPUtils2.splitLines(blob).filter((line) => line.indexOf(prefix) === 0);
    };
    SDPUtils2.parseCandidate = function(line) {
      let parts;
      if (line.indexOf("a=candidate:") === 0) {
        parts = line.substring(12).split(" ");
      } else {
        parts = line.substring(10).split(" ");
      }
      const candidate = {
        foundation: parts[0],
        component: {
          1: "rtp",
          2: "rtcp"
        }[parts[1]] || parts[1],
        protocol: parts[2].toLowerCase(),
        priority: parseInt(parts[3], 10),
        ip: parts[4],
        address: parts[4],
        // address is an alias for ip.
        port: parseInt(parts[5], 10),
        // skip parts[6] == 'typ'
        type: parts[7]
      };
      for (let i = 8; i < parts.length; i += 2) {
        switch (parts[i]) {
          case "raddr":
            candidate.relatedAddress = parts[i + 1];
            break;
          case "rport":
            candidate.relatedPort = parseInt(parts[i + 1], 10);
            break;
          case "tcptype":
            candidate.tcpType = parts[i + 1];
            break;
          case "ufrag":
            candidate.ufrag = parts[i + 1];
            candidate.usernameFragment = parts[i + 1];
            break;
          default:
            if (candidate[parts[i]] === void 0) {
              candidate[parts[i]] = parts[i + 1];
            }
            break;
        }
      }
      return candidate;
    };
    SDPUtils2.writeCandidate = function(candidate) {
      const sdp2 = [];
      sdp2.push(candidate.foundation);
      const component = candidate.component;
      if (component === "rtp") {
        sdp2.push(1);
      } else if (component === "rtcp") {
        sdp2.push(2);
      } else {
        sdp2.push(component);
      }
      sdp2.push(candidate.protocol.toUpperCase());
      sdp2.push(candidate.priority);
      sdp2.push(candidate.address || candidate.ip);
      sdp2.push(candidate.port);
      const type = candidate.type;
      sdp2.push("typ");
      sdp2.push(type);
      if (type !== "host" && candidate.relatedAddress && candidate.relatedPort) {
        sdp2.push("raddr");
        sdp2.push(candidate.relatedAddress);
        sdp2.push("rport");
        sdp2.push(candidate.relatedPort);
      }
      if (candidate.tcpType && candidate.protocol.toLowerCase() === "tcp") {
        sdp2.push("tcptype");
        sdp2.push(candidate.tcpType);
      }
      if (candidate.usernameFragment || candidate.ufrag) {
        sdp2.push("ufrag");
        sdp2.push(candidate.usernameFragment || candidate.ufrag);
      }
      return "candidate:" + sdp2.join(" ");
    };
    SDPUtils2.parseIceOptions = function(line) {
      return line.substring(14).split(" ");
    };
    SDPUtils2.parseRtpMap = function(line) {
      let parts = line.substring(9).split(" ");
      const parsed = {
        payloadType: parseInt(parts.shift(), 10)
        // was: id
      };
      parts = parts[0].split("/");
      parsed.name = parts[0];
      parsed.clockRate = parseInt(parts[1], 10);
      parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
      parsed.numChannels = parsed.channels;
      return parsed;
    };
    SDPUtils2.writeRtpMap = function(codec) {
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      const channels = codec.channels || codec.numChannels || 1;
      return "a=rtpmap:" + pt + " " + codec.name + "/" + codec.clockRate + (channels !== 1 ? "/" + channels : "") + "\r\n";
    };
    SDPUtils2.parseExtmap = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        id: parseInt(parts[0], 10),
        direction: parts[0].indexOf("/") > 0 ? parts[0].split("/")[1] : "sendrecv",
        uri: parts[1],
        attributes: parts.slice(2).join(" ")
      };
    };
    SDPUtils2.writeExtmap = function(headerExtension) {
      return "a=extmap:" + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== "sendrecv" ? "/" + headerExtension.direction : "") + " " + headerExtension.uri + (headerExtension.attributes ? " " + headerExtension.attributes : "") + "\r\n";
    };
    SDPUtils2.parseFmtp = function(line) {
      const parsed = {};
      let kv;
      const parts = line.substring(line.indexOf(" ") + 1).split(";");
      for (let j = 0; j < parts.length; j++) {
        kv = parts[j].trim().split("=");
        parsed[kv[0].trim()] = kv[1];
      }
      return parsed;
    };
    SDPUtils2.writeFmtp = function(codec) {
      let line = "";
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      if (codec.parameters && Object.keys(codec.parameters).length) {
        const params = [];
        Object.keys(codec.parameters).forEach((param) => {
          if (codec.parameters[param] !== void 0) {
            params.push(param + "=" + codec.parameters[param]);
          } else {
            params.push(param);
          }
        });
        line += "a=fmtp:" + pt + " " + params.join(";") + "\r\n";
      }
      return line;
    };
    SDPUtils2.parseRtcpFb = function(line) {
      const parts = line.substring(line.indexOf(" ") + 1).split(" ");
      return {
        type: parts.shift(),
        parameter: parts.join(" ")
      };
    };
    SDPUtils2.writeRtcpFb = function(codec) {
      let lines = "";
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
        codec.rtcpFeedback.forEach((fb) => {
          lines += "a=rtcp-fb:" + pt + " " + fb.type + (fb.parameter && fb.parameter.length ? " " + fb.parameter : "") + "\r\n";
        });
      }
      return lines;
    };
    SDPUtils2.parseSsrcMedia = function(line) {
      const sp = line.indexOf(" ");
      const parts = {
        ssrc: parseInt(line.substring(7, sp), 10)
      };
      const colon = line.indexOf(":", sp);
      if (colon > -1) {
        parts.attribute = line.substring(sp + 1, colon);
        parts.value = line.substring(colon + 1);
      } else {
        parts.attribute = line.substring(sp + 1);
      }
      return parts;
    };
    SDPUtils2.parseSsrcGroup = function(line) {
      const parts = line.substring(13).split(" ");
      return {
        semantics: parts.shift(),
        ssrcs: parts.map((ssrc) => parseInt(ssrc, 10))
      };
    };
    SDPUtils2.getMid = function(mediaSection) {
      const mid = SDPUtils2.matchPrefix(mediaSection, "a=mid:")[0];
      if (mid) {
        return mid.substring(6);
      }
    };
    SDPUtils2.parseFingerprint = function(line) {
      const parts = line.substring(14).split(" ");
      return {
        algorithm: parts[0].toLowerCase(),
        // algorithm is case-sensitive in Edge.
        value: parts[1].toUpperCase()
        // the definition is upper-case in RFC 4572.
      };
    };
    SDPUtils2.getDtlsParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.matchPrefix(mediaSection + sessionpart, "a=fingerprint:");
      return {
        role: "auto",
        fingerprints: lines.map(SDPUtils2.parseFingerprint)
      };
    };
    SDPUtils2.writeDtlsParameters = function(params, setupType) {
      let sdp2 = "a=setup:" + setupType + "\r\n";
      params.fingerprints.forEach((fp) => {
        sdp2 += "a=fingerprint:" + fp.algorithm + " " + fp.value + "\r\n";
      });
      return sdp2;
    };
    SDPUtils2.parseCryptoLine = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        tag: parseInt(parts[0], 10),
        cryptoSuite: parts[1],
        keyParams: parts[2],
        sessionParams: parts.slice(3)
      };
    };
    SDPUtils2.writeCryptoLine = function(parameters) {
      return "a=crypto:" + parameters.tag + " " + parameters.cryptoSuite + " " + (typeof parameters.keyParams === "object" ? SDPUtils2.writeCryptoKeyParams(parameters.keyParams) : parameters.keyParams) + (parameters.sessionParams ? " " + parameters.sessionParams.join(" ") : "") + "\r\n";
    };
    SDPUtils2.parseCryptoKeyParams = function(keyParams) {
      if (keyParams.indexOf("inline:") !== 0) {
        return null;
      }
      const parts = keyParams.substring(7).split("|");
      return {
        keyMethod: "inline",
        keySalt: parts[0],
        lifeTime: parts[1],
        mkiValue: parts[2] ? parts[2].split(":")[0] : void 0,
        mkiLength: parts[2] ? parts[2].split(":")[1] : void 0
      };
    };
    SDPUtils2.writeCryptoKeyParams = function(keyParams) {
      return keyParams.keyMethod + ":" + keyParams.keySalt + (keyParams.lifeTime ? "|" + keyParams.lifeTime : "") + (keyParams.mkiValue && keyParams.mkiLength ? "|" + keyParams.mkiValue + ":" + keyParams.mkiLength : "");
    };
    SDPUtils2.getCryptoParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.matchPrefix(mediaSection + sessionpart, "a=crypto:");
      return lines.map(SDPUtils2.parseCryptoLine);
    };
    SDPUtils2.getIceParameters = function(mediaSection, sessionpart) {
      const ufrag = SDPUtils2.matchPrefix(mediaSection + sessionpart, "a=ice-ufrag:")[0];
      const pwd = SDPUtils2.matchPrefix(mediaSection + sessionpart, "a=ice-pwd:")[0];
      if (!(ufrag && pwd)) {
        return null;
      }
      return {
        usernameFragment: ufrag.substring(12),
        password: pwd.substring(10)
      };
    };
    SDPUtils2.writeIceParameters = function(params) {
      let sdp2 = "a=ice-ufrag:" + params.usernameFragment + "\r\na=ice-pwd:" + params.password + "\r\n";
      if (params.iceLite) {
        sdp2 += "a=ice-lite\r\n";
      }
      return sdp2;
    };
    SDPUtils2.parseRtpParameters = function(mediaSection) {
      const description = {
        codecs: [],
        headerExtensions: [],
        fecMechanisms: [],
        rtcp: []
      };
      const lines = SDPUtils2.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      description.profile = mline[2];
      for (let i = 3; i < mline.length; i++) {
        const pt = mline[i];
        const rtpmapline = SDPUtils2.matchPrefix(mediaSection, "a=rtpmap:" + pt + " ")[0];
        if (rtpmapline) {
          const codec = SDPUtils2.parseRtpMap(rtpmapline);
          const fmtps = SDPUtils2.matchPrefix(mediaSection, "a=fmtp:" + pt + " ");
          codec.parameters = fmtps.length ? SDPUtils2.parseFmtp(fmtps[0]) : {};
          codec.rtcpFeedback = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-fb:" + pt + " ").map(SDPUtils2.parseRtcpFb);
          description.codecs.push(codec);
          switch (codec.name.toUpperCase()) {
            case "RED":
            case "ULPFEC":
              description.fecMechanisms.push(codec.name.toUpperCase());
              break;
            default:
              break;
          }
        }
      }
      SDPUtils2.matchPrefix(mediaSection, "a=extmap:").forEach((line) => {
        description.headerExtensions.push(SDPUtils2.parseExtmap(line));
      });
      const wildcardRtcpFb = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-fb:* ").map(SDPUtils2.parseRtcpFb);
      description.codecs.forEach((codec) => {
        wildcardRtcpFb.forEach((fb) => {
          const duplicate = codec.rtcpFeedback.find((existingFeedback) => {
            return existingFeedback.type === fb.type && existingFeedback.parameter === fb.parameter;
          });
          if (!duplicate) {
            codec.rtcpFeedback.push(fb);
          }
        });
      });
      return description;
    };
    SDPUtils2.writeRtpDescription = function(kind, caps) {
      let sdp2 = "";
      sdp2 += "m=" + kind + " ";
      sdp2 += caps.codecs.length > 0 ? "9" : "0";
      sdp2 += " " + (caps.profile || "UDP/TLS/RTP/SAVPF") + " ";
      sdp2 += caps.codecs.map((codec) => {
        if (codec.preferredPayloadType !== void 0) {
          return codec.preferredPayloadType;
        }
        return codec.payloadType;
      }).join(" ") + "\r\n";
      sdp2 += "c=IN IP4 0.0.0.0\r\n";
      sdp2 += "a=rtcp:9 IN IP4 0.0.0.0\r\n";
      caps.codecs.forEach((codec) => {
        sdp2 += SDPUtils2.writeRtpMap(codec);
        sdp2 += SDPUtils2.writeFmtp(codec);
        sdp2 += SDPUtils2.writeRtcpFb(codec);
      });
      let maxptime = 0;
      caps.codecs.forEach((codec) => {
        if (codec.maxptime > maxptime) {
          maxptime = codec.maxptime;
        }
      });
      if (maxptime > 0) {
        sdp2 += "a=maxptime:" + maxptime + "\r\n";
      }
      if (caps.headerExtensions) {
        caps.headerExtensions.forEach((extension) => {
          sdp2 += SDPUtils2.writeExtmap(extension);
        });
      }
      return sdp2;
    };
    SDPUtils2.parseRtpEncodingParameters = function(mediaSection) {
      const encodingParameters = [];
      const description = SDPUtils2.parseRtpParameters(mediaSection);
      const hasRed = description.fecMechanisms.indexOf("RED") !== -1;
      const hasUlpfec = description.fecMechanisms.indexOf("ULPFEC") !== -1;
      const ssrcs = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((parts) => parts.attribute === "cname");
      const primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
      let secondarySsrc;
      const flows = SDPUtils2.matchPrefix(mediaSection, "a=ssrc-group:FID").map((line) => {
        const parts = line.substring(17).split(" ");
        return parts.map((part) => parseInt(part, 10));
      });
      if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
        secondarySsrc = flows[0][1];
      }
      description.codecs.forEach((codec) => {
        if (codec.name.toUpperCase() === "RTX" && codec.parameters.apt) {
          let encParam = {
            ssrc: primarySsrc,
            codecPayloadType: parseInt(codec.parameters.apt, 10)
          };
          if (primarySsrc && secondarySsrc) {
            encParam.rtx = {
              ssrc: secondarySsrc
            };
          }
          encodingParameters.push(encParam);
          if (hasRed) {
            encParam = JSON.parse(JSON.stringify(encParam));
            encParam.fec = {
              ssrc: primarySsrc,
              mechanism: hasUlpfec ? "red+ulpfec" : "red"
            };
            encodingParameters.push(encParam);
          }
        }
      });
      if (encodingParameters.length === 0 && primarySsrc) {
        encodingParameters.push({
          ssrc: primarySsrc
        });
      }
      let bandwidth = SDPUtils2.matchPrefix(mediaSection, "b=");
      if (bandwidth.length) {
        if (bandwidth[0].indexOf("b=TIAS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(7), 10);
        } else if (bandwidth[0].indexOf("b=AS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(5), 10) * 1e3 * 0.95 - 50 * 40 * 8;
        } else {
          bandwidth = void 0;
        }
        encodingParameters.forEach((params) => {
          params.maxBitrate = bandwidth;
        });
      }
      return encodingParameters;
    };
    SDPUtils2.parseRtcpParameters = function(mediaSection) {
      const rtcpParameters = {};
      const remoteSsrc = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((obj) => obj.attribute === "cname")[0];
      if (remoteSsrc) {
        rtcpParameters.cname = remoteSsrc.value;
        rtcpParameters.ssrc = remoteSsrc.ssrc;
      }
      const rsize = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-rsize");
      rtcpParameters.reducedSize = rsize.length > 0;
      rtcpParameters.compound = rsize.length === 0;
      const mux = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-mux");
      rtcpParameters.mux = mux.length > 0;
      return rtcpParameters;
    };
    SDPUtils2.writeRtcpParameters = function(rtcpParameters) {
      let sdp2 = "";
      if (rtcpParameters.reducedSize) {
        sdp2 += "a=rtcp-rsize\r\n";
      }
      if (rtcpParameters.mux) {
        sdp2 += "a=rtcp-mux\r\n";
      }
      if (rtcpParameters.ssrc !== void 0 && rtcpParameters.cname) {
        sdp2 += "a=ssrc:" + rtcpParameters.ssrc + " cname:" + rtcpParameters.cname + "\r\n";
      }
      return sdp2;
    };
    SDPUtils2.parseMsid = function(mediaSection) {
      let parts;
      const spec = SDPUtils2.matchPrefix(mediaSection, "a=msid:");
      if (spec.length === 1) {
        parts = spec[0].substring(7).split(" ");
        return {
          stream: parts[0],
          track: parts[1]
        };
      }
      const planB = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((msidParts) => msidParts.attribute === "msid");
      if (planB.length > 0) {
        parts = planB[0].value.split(" ");
        return {
          stream: parts[0],
          track: parts[1]
        };
      }
    };
    SDPUtils2.parseSctpDescription = function(mediaSection) {
      const mline = SDPUtils2.parseMLine(mediaSection);
      const maxSizeLine = SDPUtils2.matchPrefix(mediaSection, "a=max-message-size:");
      let maxMessageSize;
      if (maxSizeLine.length > 0) {
        maxMessageSize = parseInt(maxSizeLine[0].substring(19), 10);
      }
      if (isNaN(maxMessageSize)) {
        maxMessageSize = 65536;
      }
      const sctpPort = SDPUtils2.matchPrefix(mediaSection, "a=sctp-port:");
      if (sctpPort.length > 0) {
        return {
          port: parseInt(sctpPort[0].substring(12), 10),
          protocol: mline.fmt,
          maxMessageSize
        };
      }
      const sctpMapLines = SDPUtils2.matchPrefix(mediaSection, "a=sctpmap:");
      if (sctpMapLines.length > 0) {
        const parts = sctpMapLines[0].substring(10).split(" ");
        return {
          port: parseInt(parts[0], 10),
          protocol: parts[1],
          maxMessageSize
        };
      }
    };
    SDPUtils2.writeSctpDescription = function(media, sctp) {
      let output = [];
      if (media.protocol !== "DTLS/SCTP") {
        output = ["m=" + media.kind + " 9 " + media.protocol + " " + sctp.protocol + "\r\n", "c=IN IP4 0.0.0.0\r\n", "a=sctp-port:" + sctp.port + "\r\n"];
      } else {
        output = ["m=" + media.kind + " 9 " + media.protocol + " " + sctp.port + "\r\n", "c=IN IP4 0.0.0.0\r\n", "a=sctpmap:" + sctp.port + " " + sctp.protocol + " 65535\r\n"];
      }
      if (sctp.maxMessageSize !== void 0) {
        output.push("a=max-message-size:" + sctp.maxMessageSize + "\r\n");
      }
      return output.join("");
    };
    SDPUtils2.generateSessionId = function() {
      return Math.random().toString().substr(2, 22);
    };
    SDPUtils2.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
      let sessionId;
      const version2 = sessVer !== void 0 ? sessVer : 2;
      if (sessId) {
        sessionId = sessId;
      } else {
        sessionId = SDPUtils2.generateSessionId();
      }
      const user = sessUser || "thisisadapterortc";
      return "v=0\r\no=" + user + " " + sessionId + " " + version2 + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
    };
    SDPUtils2.getDirection = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.splitLines(mediaSection);
      for (let i = 0; i < lines.length; i++) {
        switch (lines[i]) {
          case "a=sendrecv":
          case "a=sendonly":
          case "a=recvonly":
          case "a=inactive":
            return lines[i].substring(2);
          default:
        }
      }
      if (sessionpart) {
        return SDPUtils2.getDirection(sessionpart);
      }
      return "sendrecv";
    };
    SDPUtils2.getKind = function(mediaSection) {
      const lines = SDPUtils2.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      return mline[0].substring(2);
    };
    SDPUtils2.isRejected = function(mediaSection) {
      return mediaSection.split(" ", 2)[1] === "0";
    };
    SDPUtils2.parseMLine = function(mediaSection) {
      const lines = SDPUtils2.splitLines(mediaSection);
      const parts = lines[0].substring(2).split(" ");
      return {
        kind: parts[0],
        port: parseInt(parts[1], 10),
        protocol: parts[2],
        fmt: parts.slice(3).join(" ")
      };
    };
    SDPUtils2.parseOLine = function(mediaSection) {
      const line = SDPUtils2.matchPrefix(mediaSection, "o=")[0];
      const parts = line.substring(2).split(" ");
      return {
        username: parts[0],
        sessionId: parts[1],
        sessionVersion: parseInt(parts[2], 10),
        netType: parts[3],
        addressType: parts[4],
        address: parts[5]
      };
    };
    SDPUtils2.isValidSDP = function(blob) {
      if (typeof blob !== "string" || blob.length === 0) {
        return false;
      }
      const lines = SDPUtils2.splitLines(blob);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].length < 2 || lines[i].charAt(1) !== "=") {
          return false;
        }
      }
      return true;
    };
    if (typeof module === "object") {
      module.exports = SDPUtils2;
    }
  }
});

// node_modules/@stream-io/video-client/node_modules/ua-parser-js/src/ua-parser.js
var require_ua_parser = __commonJS({
  "node_modules/@stream-io/video-client/node_modules/ua-parser-js/src/ua-parser.js"(exports, module) {
    (function(window2, undefined2) {
      "use strict";
      var LIBVERSION = "1.0.40", EMPTY = "", UNKNOWN = "?", FUNC_TYPE = "function", UNDEF_TYPE = "undefined", OBJ_TYPE = "object", STR_TYPE = "string", MAJOR = "major", MODEL = "model", NAME = "name", TYPE = "type", VENDOR = "vendor", VERSION = "version", ARCHITECTURE = "architecture", CONSOLE = "console", MOBILE = "mobile", TABLET = "tablet", SMARTTV = "smarttv", WEARABLE = "wearable", EMBEDDED = "embedded", UA_MAX_LENGTH = 500;
      var AMAZON = "Amazon", APPLE = "Apple", ASUS = "ASUS", BLACKBERRY = "BlackBerry", BROWSER = "Browser", CHROME = "Chrome", EDGE = "Edge", FIREFOX = "Firefox", GOOGLE = "Google", HUAWEI = "Huawei", LG = "LG", MICROSOFT = "Microsoft", MOTOROLA = "Motorola", OPERA = "Opera", SAMSUNG = "Samsung", SHARP = "Sharp", SONY = "Sony", XIAOMI = "Xiaomi", ZEBRA = "Zebra", FACEBOOK = "Facebook", CHROMIUM_OS = "Chromium OS", MAC_OS = "Mac OS", SUFFIX_BROWSER = " Browser";
      var extend = function(regexes2, extensions) {
        var mergedRegexes = {};
        for (var i in regexes2) {
          if (extensions[i] && extensions[i].length % 2 === 0) {
            mergedRegexes[i] = extensions[i].concat(regexes2[i]);
          } else {
            mergedRegexes[i] = regexes2[i];
          }
        }
        return mergedRegexes;
      }, enumerize = function(arr) {
        var enums = {};
        for (var i = 0; i < arr.length; i++) {
          enums[arr[i].toUpperCase()] = arr[i];
        }
        return enums;
      }, has = function(str1, str2) {
        return typeof str1 === STR_TYPE ? lowerize(str2).indexOf(lowerize(str1)) !== -1 : false;
      }, lowerize = function(str) {
        return str.toLowerCase();
      }, majorize = function(version2) {
        return typeof version2 === STR_TYPE ? version2.replace(/[^\d\.]/g, EMPTY).split(".")[0] : undefined2;
      }, trim = function(str, len) {
        if (typeof str === STR_TYPE) {
          str = str.replace(/^\s\s*/, EMPTY);
          return typeof len === UNDEF_TYPE ? str : str.substring(0, UA_MAX_LENGTH);
        }
      };
      var rgxMapper = function(ua, arrays) {
        var i = 0, j, k, p, q, matches, match;
        while (i < arrays.length && !matches) {
          var regex = arrays[i], props = arrays[i + 1];
          j = k = 0;
          while (j < regex.length && !matches) {
            if (!regex[j]) {
              break;
            }
            matches = regex[j++].exec(ua);
            if (!!matches) {
              for (p = 0; p < props.length; p++) {
                match = matches[++k];
                q = props[p];
                if (typeof q === OBJ_TYPE && q.length > 0) {
                  if (q.length === 2) {
                    if (typeof q[1] == FUNC_TYPE) {
                      this[q[0]] = q[1].call(this, match);
                    } else {
                      this[q[0]] = q[1];
                    }
                  } else if (q.length === 3) {
                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                      this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined2;
                    } else {
                      this[q[0]] = match ? match.replace(q[1], q[2]) : undefined2;
                    }
                  } else if (q.length === 4) {
                    this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined2;
                  }
                } else {
                  this[q] = match ? match : undefined2;
                }
              }
            }
          }
          i += 2;
        }
      }, strMapper = function(str, map2) {
        for (var i in map2) {
          if (typeof map2[i] === OBJ_TYPE && map2[i].length > 0) {
            for (var j = 0; j < map2[i].length; j++) {
              if (has(map2[i][j], str)) {
                return i === UNKNOWN ? undefined2 : i;
              }
            }
          } else if (has(map2[i], str)) {
            return i === UNKNOWN ? undefined2 : i;
          }
        }
        return map2.hasOwnProperty("*") ? map2["*"] : str;
      };
      var oldSafariMap = {
        "1.0": "/8",
        "1.2": "/1",
        "1.3": "/3",
        "2.0": "/412",
        "2.0.2": "/416",
        "2.0.3": "/417",
        "2.0.4": "/419",
        "?": "/"
      }, windowsVersionMap = {
        "ME": "4.90",
        "NT 3.11": "NT3.51",
        "NT 4.0": "NT4.0",
        "2000": "NT 5.0",
        "XP": ["NT 5.1", "NT 5.2"],
        "Vista": "NT 6.0",
        "7": "NT 6.1",
        "8": "NT 6.2",
        "8.1": "NT 6.3",
        "10": ["NT 6.4", "NT 10.0"],
        "RT": "ARM"
      };
      var regexes = {
        browser: [[
          /\b(?:crmo|crios)\/([\w\.]+)/i
          // Chrome for Android/iOS
        ], [VERSION, [NAME, "Chrome"]], [
          /edg(?:e|ios|a)?\/([\w\.]+)/i
          // Microsoft Edge
        ], [VERSION, [NAME, "Edge"]], [
          // Presto based
          /(opera mini)\/([-\w\.]+)/i,
          // Opera Mini
          /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,
          // Opera Mobi/Tablet
          /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i
          // Opera
        ], [NAME, VERSION], [
          /opios[\/ ]+([\w\.]+)/i
          // Opera mini on iphone >= 8.0
        ], [VERSION, [NAME, OPERA + " Mini"]], [
          /\bop(?:rg)?x\/([\w\.]+)/i
          // Opera GX
        ], [VERSION, [NAME, OPERA + " GX"]], [
          /\bopr\/([\w\.]+)/i
          // Opera Webkit
        ], [VERSION, [NAME, OPERA]], [
          // Mixed
          /\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i
          // Baidu
        ], [VERSION, [NAME, "Baidu"]], [
          /\b(?:mxbrowser|mxios|myie2)\/?([-\w\.]*)\b/i
          // Maxthon
        ], [VERSION, [NAME, "Maxthon"]], [
          /(kindle)\/([\w\.]+)/i,
          // Kindle
          /(lunascape|maxthon|netfront|jasmine|blazer|sleipnir)[\/ ]?([\w\.]*)/i,
          // Lunascape/Maxthon/Netfront/Jasmine/Blazer/Sleipnir
          // Trident based
          /(avant|iemobile|slim(?:browser|boat|jet))[\/ ]?([\d\.]*)/i,
          // Avant/IEMobile/SlimBrowser/SlimBoat/Slimjet
          /(?:ms|\()(ie) ([\w\.]+)/i,
          // Internet Explorer
          // Blink/Webkit/KHTML based                                         // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
          /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|duckduckgo|klar|helio|(?=comodo_)?dragon)\/([-\w\.]+)/i,
          // Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ//Vivaldi/DuckDuckGo/Klar/Helio/Dragon
          /(heytap|ovi|115)browser\/([\d\.]+)/i,
          // HeyTap/Ovi/115
          /(weibo)__([\d\.]+)/i
          // Weibo
        ], [NAME, VERSION], [
          /quark(?:pc)?\/([-\w\.]+)/i
          // Quark
        ], [VERSION, [NAME, "Quark"]], [
          /\bddg\/([\w\.]+)/i
          // DuckDuckGo
        ], [VERSION, [NAME, "DuckDuckGo"]], [
          /(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i
          // UCBrowser
        ], [VERSION, [NAME, "UC" + BROWSER]], [
          /microm.+\bqbcore\/([\w\.]+)/i,
          // WeChat Desktop for Windows Built-in Browser
          /\bqbcore\/([\w\.]+).+microm/i,
          /micromessenger\/([\w\.]+)/i
          // WeChat
        ], [VERSION, [NAME, "WeChat"]], [
          /konqueror\/([\w\.]+)/i
          // Konqueror
        ], [VERSION, [NAME, "Konqueror"]], [
          /trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i
          // IE11
        ], [VERSION, [NAME, "IE"]], [
          /ya(?:search)?browser\/([\w\.]+)/i
          // Yandex
        ], [VERSION, [NAME, "Yandex"]], [
          /slbrowser\/([\w\.]+)/i
          // Smart Lenovo Browser
        ], [VERSION, [NAME, "Smart Lenovo " + BROWSER]], [
          /(avast|avg)\/([\w\.]+)/i
          // Avast/AVG Secure Browser
        ], [[NAME, /(.+)/, "$1 Secure " + BROWSER], VERSION], [
          /\bfocus\/([\w\.]+)/i
          // Firefox Focus
        ], [VERSION, [NAME, FIREFOX + " Focus"]], [
          /\bopt\/([\w\.]+)/i
          // Opera Touch
        ], [VERSION, [NAME, OPERA + " Touch"]], [
          /coc_coc\w+\/([\w\.]+)/i
          // Coc Coc Browser
        ], [VERSION, [NAME, "Coc Coc"]], [
          /dolfin\/([\w\.]+)/i
          // Dolphin
        ], [VERSION, [NAME, "Dolphin"]], [
          /coast\/([\w\.]+)/i
          // Opera Coast
        ], [VERSION, [NAME, OPERA + " Coast"]], [
          /miuibrowser\/([\w\.]+)/i
          // MIUI Browser
        ], [VERSION, [NAME, "MIUI" + SUFFIX_BROWSER]], [
          /fxios\/([\w\.-]+)/i
          // Firefox for iOS
        ], [VERSION, [NAME, FIREFOX]], [
          /\bqihoobrowser\/?([\w\.]*)/i
          // 360
        ], [VERSION, [NAME, "360"]], [
          /\b(qq)\/([\w\.]+)/i
          // QQ
        ], [[NAME, /(.+)/, "$1Browser"], VERSION], [/(oculus|sailfish|huawei|vivo|pico)browser\/([\w\.]+)/i], [[NAME, /(.+)/, "$1" + SUFFIX_BROWSER], VERSION], [
          // Oculus/Sailfish/HuaweiBrowser/VivoBrowser/PicoBrowser
          /samsungbrowser\/([\w\.]+)/i
          // Samsung Internet
        ], [VERSION, [NAME, SAMSUNG + " Internet"]], [
          /metasr[\/ ]?([\d\.]+)/i
          // Sogou Explorer
        ], [VERSION, [NAME, "Sogou Explorer"]], [
          /(sogou)mo\w+\/([\d\.]+)/i
          // Sogou Mobile
        ], [[NAME, "Sogou Mobile"], VERSION], [
          /(electron)\/([\w\.]+) safari/i,
          // Electron-based App
          /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,
          // Tesla
          /m?(qqbrowser|2345(?=browser|chrome|explorer))\w*[\/ ]?v?([\w\.]+)/i
          // QQ/2345
        ], [NAME, VERSION], [
          /(lbbrowser|rekonq)/i,
          // LieBao Browser/Rekonq
          /\[(linkedin)app\]/i
          // LinkedIn App for iOS & Android
        ], [NAME], [
          /ome\/([\w\.]+) \w* ?(iron) saf/i,
          // Iron
          /ome\/([\w\.]+).+qihu (360)[es]e/i
          // 360
        ], [VERSION, NAME], [
          // WebView
          /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i
          // Facebook App for iOS & Android
        ], [[NAME, FACEBOOK], VERSION], [
          /(Klarna)\/([\w\.]+)/i,
          // Klarna Shopping Browser for iOS & Android
          /(kakao(?:talk|story))[\/ ]([\w\.]+)/i,
          // Kakao App
          /(naver)\(.*?(\d+\.[\w\.]+).*\)/i,
          // Naver InApp
          /safari (line)\/([\w\.]+)/i,
          // Line App for iOS
          /\b(line)\/([\w\.]+)\/iab/i,
          // Line App for Android
          /(alipay)client\/([\w\.]+)/i,
          // Alipay
          /(twitter)(?:and| f.+e\/([\w\.]+))/i,
          // Twitter
          /(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i
          // Chromium/Instagram/Snapchat
        ], [NAME, VERSION], [
          /\bgsa\/([\w\.]+) .*safari\//i
          // Google Search Appliance on iOS
        ], [VERSION, [NAME, "GSA"]], [
          /musical_ly(?:.+app_?version\/|_)([\w\.]+)/i
          // TikTok
        ], [VERSION, [NAME, "TikTok"]], [
          /headlesschrome(?:\/([\w\.]+)| )/i
          // Chrome Headless
        ], [VERSION, [NAME, CHROME + " Headless"]], [
          / wv\).+(chrome)\/([\w\.]+)/i
          // Chrome WebView
        ], [[NAME, CHROME + " WebView"], VERSION], [
          /droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i
          // Android Browser
        ], [VERSION, [NAME, "Android " + BROWSER]], [
          /(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i
          // Chrome/OmniWeb/Arora/Tizen/Nokia
        ], [NAME, VERSION], [
          /version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i
          // Mobile Safari
        ], [VERSION, [NAME, "Mobile Safari"]], [
          /version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i
          // Safari & Safari Mobile
        ], [VERSION, NAME], [
          /webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i
          // Safari < 3.0
        ], [NAME, [VERSION, strMapper, oldSafariMap]], [/(webkit|khtml)\/([\w\.]+)/i], [NAME, VERSION], [
          // Gecko based
          /(navigator|netscape\d?)\/([-\w\.]+)/i
          // Netscape
        ], [[NAME, "Netscape"], VERSION], [
          /(wolvic|librewolf)\/([\w\.]+)/i
          // Wolvic/LibreWolf
        ], [NAME, VERSION], [
          /mobile vr; rv:([\w\.]+)\).+firefox/i
          // Firefox Reality
        ], [VERSION, [NAME, FIREFOX + " Reality"]], [
          /ekiohf.+(flow)\/([\w\.]+)/i,
          // Flow
          /(swiftfox)/i,
          // Swiftfox
          /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror)[\/ ]?([\w\.\+]+)/i,
          // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
          /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
          // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
          /(firefox)\/([\w\.]+)/i,
          // Other Firefox-based
          /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,
          // Mozilla
          // Other
          /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
          // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Obigo/Mosaic/Go/ICE/UP.Browser
          /(links) \(([\w\.]+)/i
          // Links
        ], [NAME, [VERSION, /_/g, "."]], [
          /(cobalt)\/([\w\.]+)/i
          // Cobalt
        ], [NAME, [VERSION, /master.|lts./, ""]]],
        cpu: [[
          /(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i
          // AMD64 (x64)
        ], [[ARCHITECTURE, "amd64"]], [
          /(ia32(?=;))/i
          // IA32 (quicktime)
        ], [[ARCHITECTURE, lowerize]], [
          /((?:i[346]|x)86)[;\)]/i
          // IA32 (x86)
        ], [[ARCHITECTURE, "ia32"]], [
          /\b(aarch64|arm(v?8e?l?|_?64))\b/i
          // ARM64
        ], [[ARCHITECTURE, "arm64"]], [
          /\b(arm(?:v[67])?ht?n?[fl]p?)\b/i
          // ARMHF
        ], [[ARCHITECTURE, "armhf"]], [
          // PocketPC mistakenly identified as PowerPC
          /windows (ce|mobile); ppc;/i
        ], [[ARCHITECTURE, "arm"]], [
          /((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i
          // PowerPC
        ], [[ARCHITECTURE, /ower/, EMPTY, lowerize]], [
          /(sun4\w)[;\)]/i
          // SPARC
        ], [[ARCHITECTURE, "sparc"]], [
          /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i
          // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
        ], [[ARCHITECTURE, lowerize]]],
        device: [[
          //////////////////////////
          // MOBILES & TABLETS
          /////////////////////////
          // Samsung
          /\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i
        ], [MODEL, [VENDOR, SAMSUNG], [TYPE, TABLET]], [/\b((?:s[cgp]h|gt|sm)-(?![lr])\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]((?!sm-[lr])[-\w]+)/i, /sec-(sgh\w+)/i], [MODEL, [VENDOR, SAMSUNG], [TYPE, MOBILE]], [
          // Apple
          /(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i
          // iPod/iPhone
        ], [MODEL, [VENDOR, APPLE], [TYPE, MOBILE]], [
          /\((ipad);[-\w\),; ]+apple/i,
          // iPad
          /applecoremedia\/[\w\.]+ \((ipad)/i,
          /\b(ipad)\d\d?,\d\d?[;\]].+ios/i
        ], [MODEL, [VENDOR, APPLE], [TYPE, TABLET]], [/(macintosh);/i], [MODEL, [VENDOR, APPLE]], [
          // Sharp
          /\b(sh-?[altvz]?\d\d[a-ekm]?)/i
        ], [MODEL, [VENDOR, SHARP], [TYPE, MOBILE]], [
          // Honor
          /(?:honor)([-\w ]+)[;\)]/i
        ], [MODEL, [VENDOR, "Honor"], [TYPE, MOBILE]], [
          // Huawei
          /\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i
        ], [MODEL, [VENDOR, HUAWEI], [TYPE, TABLET]], [/(?:huawei)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [MODEL, [VENDOR, HUAWEI], [TYPE, MOBILE]], [
          // Xiaomi
          /\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,
          // Xiaomi POCO
          /\b; (\w+) build\/hm\1/i,
          // Xiaomi Hongmi 'numeric' models
          /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
          // Xiaomi Hongmi
          /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,
          // Xiaomi Redmi
          /oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i,
          // Xiaomi Redmi 'numeric' models
          /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite|pro)?)(?: bui|\))/i
          // Xiaomi Mi
        ], [[MODEL, /_/g, " "], [VENDOR, XIAOMI], [TYPE, MOBILE]], [
          /oid[^\)]+; (2\d{4}(283|rpbf)[cgl])( bui|\))/i,
          // Redmi Pad
          /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i
          // Mi Pad tablets
        ], [[MODEL, /_/g, " "], [VENDOR, XIAOMI], [TYPE, TABLET]], [
          // OPPO
          /; (\w+) bui.+ oppo/i,
          /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i
        ], [MODEL, [VENDOR, "OPPO"], [TYPE, MOBILE]], [/\b(opd2\d{3}a?) bui/i], [MODEL, [VENDOR, "OPPO"], [TYPE, TABLET]], [
          // Vivo
          /vivo (\w+)(?: bui|\))/i,
          /\b(v[12]\d{3}\w?[at])(?: bui|;)/i
        ], [MODEL, [VENDOR, "Vivo"], [TYPE, MOBILE]], [
          // Realme
          /\b(rmx[1-3]\d{3})(?: bui|;|\))/i
        ], [MODEL, [VENDOR, "Realme"], [TYPE, MOBILE]], [
          // Motorola
          /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
          /\bmot(?:orola)?[- ](\w*)/i,
          /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
        ], [MODEL, [VENDOR, MOTOROLA], [TYPE, MOBILE]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [MODEL, [VENDOR, MOTOROLA], [TYPE, TABLET]], [
          // LG
          /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i
        ], [MODEL, [VENDOR, LG], [TYPE, TABLET]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [MODEL, [VENDOR, LG], [TYPE, MOBILE]], [
          // Lenovo
          /(ideatab[-\w ]+)/i,
          /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i
        ], [MODEL, [VENDOR, "Lenovo"], [TYPE, TABLET]], [
          // Nokia
          /(?:maemo|nokia).*(n900|lumia \d+)/i,
          /nokia[-_ ]?([-\w\.]*)/i
        ], [[MODEL, /_/g, " "], [VENDOR, "Nokia"], [TYPE, MOBILE]], [
          // Google
          /(pixel c)\b/i
          // Google Pixel C
        ], [MODEL, [VENDOR, GOOGLE], [TYPE, TABLET]], [
          /droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i
          // Google Pixel
        ], [MODEL, [VENDOR, GOOGLE], [TYPE, MOBILE]], [
          // Sony
          /droid.+; (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i
        ], [MODEL, [VENDOR, SONY], [TYPE, MOBILE]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[MODEL, "Xperia Tablet"], [VENDOR, SONY], [TYPE, TABLET]], [
          // OnePlus
          / (kb2005|in20[12]5|be20[12][59])\b/i,
          /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i
        ], [MODEL, [VENDOR, "OnePlus"], [TYPE, MOBILE]], [
          // Amazon
          /(alexa)webm/i,
          /(kf[a-z]{2}wi|aeo(?!bc)\w\w)( bui|\))/i,
          // Kindle Fire without Silk / Echo Show
          /(kf[a-z]+)( bui|\)).+silk\//i
          // Kindle Fire HD
        ], [MODEL, [VENDOR, AMAZON], [TYPE, TABLET]], [
          /((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i
          // Fire Phone
        ], [[MODEL, /(.+)/g, "Fire Phone $1"], [VENDOR, AMAZON], [TYPE, MOBILE]], [
          // BlackBerry
          /(playbook);[-\w\),; ]+(rim)/i
          // BlackBerry PlayBook
        ], [MODEL, VENDOR, [TYPE, TABLET]], [
          /\b((?:bb[a-f]|st[hv])100-\d)/i,
          /\(bb10; (\w+)/i
          // BlackBerry 10
        ], [MODEL, [VENDOR, BLACKBERRY], [TYPE, MOBILE]], [
          // Asus
          /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i
        ], [MODEL, [VENDOR, ASUS], [TYPE, TABLET]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [MODEL, [VENDOR, ASUS], [TYPE, MOBILE]], [
          // HTC
          /(nexus 9)/i
          // HTC Nexus 9
        ], [MODEL, [VENDOR, "HTC"], [TYPE, TABLET]], [
          /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
          // HTC
          // ZTE
          /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
          /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i
          // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
        ], [VENDOR, [MODEL, /_/g, " "], [TYPE, MOBILE]], [
          // TCL
          /droid [\w\.]+; ((?:8[14]9[16]|9(?:0(?:48|60|8[01])|1(?:3[27]|66)|2(?:6[69]|9[56])|466))[gqswx])\w*(\)| bui)/i
        ], [MODEL, [VENDOR, "TCL"], [TYPE, TABLET]], [
          // itel
          /(itel) ((\w+))/i
        ], [[VENDOR, lowerize], MODEL, [TYPE, strMapper, {
          "tablet": ["p10001l", "w7001"],
          "*": "mobile"
        }]], [
          // Acer
          /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i
        ], [MODEL, [VENDOR, "Acer"], [TYPE, TABLET]], [
          // Meizu
          /droid.+; (m[1-5] note) bui/i,
          /\bmz-([-\w]{2,})/i
        ], [MODEL, [VENDOR, "Meizu"], [TYPE, MOBILE]], [
          // Ulefone
          /; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i
        ], [MODEL, [VENDOR, "Ulefone"], [TYPE, MOBILE]], [
          // Energizer
          /; (energy ?\w+)(?: bui|\))/i,
          /; energizer ([\w ]+)(?: bui|\))/i
        ], [MODEL, [VENDOR, "Energizer"], [TYPE, MOBILE]], [
          // Cat
          /; cat (b35);/i,
          /; (b15q?|s22 flip|s48c|s62 pro)(?: bui|\))/i
        ], [MODEL, [VENDOR, "Cat"], [TYPE, MOBILE]], [
          // Smartfren
          /((?:new )?andromax[\w- ]+)(?: bui|\))/i
        ], [MODEL, [VENDOR, "Smartfren"], [TYPE, MOBILE]], [
          // Nothing
          /droid.+; (a(?:015|06[35]|142p?))/i
        ], [MODEL, [VENDOR, "Nothing"], [TYPE, MOBILE]], [
          // MIXED
          /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno|micromax|advan)[-_ ]?([-\w]*)/i,
          // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron/Infinix/Tecno/Micromax/Advan
          /; (imo) ((?!tab)[\w ]+?)(?: bui|\))/i,
          // IMO
          /(hp) ([\w ]+\w)/i,
          // HP iPAQ
          /(asus)-?(\w+)/i,
          // Asus
          /(microsoft); (lumia[\w ]+)/i,
          // Microsoft Lumia
          /(lenovo)[-_ ]?([-\w]+)/i,
          // Lenovo
          /(jolla)/i,
          // Jolla
          /(oppo) ?([\w ]+) bui/i
          // OPPO
        ], [VENDOR, MODEL, [TYPE, MOBILE]], [
          /(imo) (tab \w+)/i,
          // IMO
          /(kobo)\s(ereader|touch)/i,
          // Kobo
          /(archos) (gamepad2?)/i,
          // Archos
          /(hp).+(touchpad(?!.+tablet)|tablet)/i,
          // HP TouchPad
          /(kindle)\/([\w\.]+)/i,
          // Kindle
          /(nook)[\w ]+build\/(\w+)/i,
          // Nook
          /(dell) (strea[kpr\d ]*[\dko])/i,
          // Dell Streak
          /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,
          // Le Pan Tablets
          /(trinity)[- ]*(t\d{3}) bui/i,
          // Trinity Tablets
          /(gigaset)[- ]+(q\w{1,9}) bui/i,
          // Gigaset Tablets
          /(vodafone) ([\w ]+)(?:\)| bui)/i
          // Vodafone
        ], [VENDOR, MODEL, [TYPE, TABLET]], [
          /(surface duo)/i
          // Surface Duo
        ], [MODEL, [VENDOR, MICROSOFT], [TYPE, TABLET]], [
          /droid [\d\.]+; (fp\du?)(?: b|\))/i
          // Fairphone
        ], [MODEL, [VENDOR, "Fairphone"], [TYPE, MOBILE]], [
          /(u304aa)/i
          // AT&T
        ], [MODEL, [VENDOR, "AT&T"], [TYPE, MOBILE]], [
          /\bsie-(\w*)/i
          // Siemens
        ], [MODEL, [VENDOR, "Siemens"], [TYPE, MOBILE]], [
          /\b(rct\w+) b/i
          // RCA Tablets
        ], [MODEL, [VENDOR, "RCA"], [TYPE, TABLET]], [
          /\b(venue[\d ]{2,7}) b/i
          // Dell Venue Tablets
        ], [MODEL, [VENDOR, "Dell"], [TYPE, TABLET]], [
          /\b(q(?:mv|ta)\w+) b/i
          // Verizon Tablet
        ], [MODEL, [VENDOR, "Verizon"], [TYPE, TABLET]], [
          /\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i
          // Barnes & Noble Tablet
        ], [MODEL, [VENDOR, "Barnes & Noble"], [TYPE, TABLET]], [/\b(tm\d{3}\w+) b/i], [MODEL, [VENDOR, "NuVision"], [TYPE, TABLET]], [
          /\b(k88) b/i
          // ZTE K Series Tablet
        ], [MODEL, [VENDOR, "ZTE"], [TYPE, TABLET]], [
          /\b(nx\d{3}j) b/i
          // ZTE Nubia
        ], [MODEL, [VENDOR, "ZTE"], [TYPE, MOBILE]], [
          /\b(gen\d{3}) b.+49h/i
          // Swiss GEN Mobile
        ], [MODEL, [VENDOR, "Swiss"], [TYPE, MOBILE]], [
          /\b(zur\d{3}) b/i
          // Swiss ZUR Tablet
        ], [MODEL, [VENDOR, "Swiss"], [TYPE, TABLET]], [
          /\b((zeki)?tb.*\b) b/i
          // Zeki Tablets
        ], [MODEL, [VENDOR, "Zeki"], [TYPE, TABLET]], [
          /\b([yr]\d{2}) b/i,
          /\b(dragon[- ]+touch |dt)(\w{5}) b/i
          // Dragon Touch Tablet
        ], [[VENDOR, "Dragon Touch"], MODEL, [TYPE, TABLET]], [
          /\b(ns-?\w{0,9}) b/i
          // Insignia Tablets
        ], [MODEL, [VENDOR, "Insignia"], [TYPE, TABLET]], [
          /\b((nxa|next)-?\w{0,9}) b/i
          // NextBook Tablets
        ], [MODEL, [VENDOR, "NextBook"], [TYPE, TABLET]], [
          /\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i
          // Voice Xtreme Phones
        ], [[VENDOR, "Voice"], MODEL, [TYPE, MOBILE]], [
          /\b(lvtel\-)?(v1[12]) b/i
          // LvTel Phones
        ], [[VENDOR, "LvTel"], MODEL, [TYPE, MOBILE]], [
          /\b(ph-1) /i
          // Essential PH-1
        ], [MODEL, [VENDOR, "Essential"], [TYPE, MOBILE]], [
          /\b(v(100md|700na|7011|917g).*\b) b/i
          // Envizen Tablets
        ], [MODEL, [VENDOR, "Envizen"], [TYPE, TABLET]], [
          /\b(trio[-\w\. ]+) b/i
          // MachSpeed Tablets
        ], [MODEL, [VENDOR, "MachSpeed"], [TYPE, TABLET]], [
          /\btu_(1491) b/i
          // Rotor Tablets
        ], [MODEL, [VENDOR, "Rotor"], [TYPE, TABLET]], [
          /(shield[\w ]+) b/i
          // Nvidia Shield Tablets
        ], [MODEL, [VENDOR, "Nvidia"], [TYPE, TABLET]], [
          /(sprint) (\w+)/i
          // Sprint Phones
        ], [VENDOR, MODEL, [TYPE, MOBILE]], [
          /(kin\.[onetw]{3})/i
          // Microsoft Kin
        ], [[MODEL, /\./g, " "], [VENDOR, MICROSOFT], [TYPE, MOBILE]], [
          /droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i
          // Zebra
        ], [MODEL, [VENDOR, ZEBRA], [TYPE, TABLET]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [MODEL, [VENDOR, ZEBRA], [TYPE, MOBILE]], [
          ///////////////////
          // SMARTTVS
          ///////////////////
          /smart-tv.+(samsung)/i
          // Samsung
        ], [VENDOR, [TYPE, SMARTTV]], [/hbbtv.+maple;(\d+)/i], [[MODEL, /^/, "SmartTV"], [VENDOR, SAMSUNG], [TYPE, SMARTTV]], [
          /(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i
          // LG SmartTV
        ], [[VENDOR, LG], [TYPE, SMARTTV]], [
          /(apple) ?tv/i
          // Apple TV
        ], [VENDOR, [MODEL, APPLE + " TV"], [TYPE, SMARTTV]], [
          /crkey/i
          // Google Chromecast
        ], [[MODEL, CHROME + "cast"], [VENDOR, GOOGLE], [TYPE, SMARTTV]], [
          /droid.+aft(\w+)( bui|\))/i
          // Fire TV
        ], [MODEL, [VENDOR, AMAZON], [TYPE, SMARTTV]], [
          /\(dtv[\);].+(aquos)/i,
          /(aquos-tv[\w ]+)\)/i
          // Sharp
        ], [MODEL, [VENDOR, SHARP], [TYPE, SMARTTV]], [
          /(bravia[\w ]+)( bui|\))/i
          // Sony
        ], [MODEL, [VENDOR, SONY], [TYPE, SMARTTV]], [
          /(mitv-\w{5}) bui/i
          // Xiaomi
        ], [MODEL, [VENDOR, XIAOMI], [TYPE, SMARTTV]], [
          /Hbbtv.*(technisat) (.*);/i
          // TechniSAT
        ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
          /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,
          // Roku
          /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i
          // HbbTV devices
        ], [[VENDOR, trim], [MODEL, trim], [TYPE, SMARTTV]], [
          /\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i
          // SmartTV from Unidentified Vendors
        ], [[TYPE, SMARTTV]], [
          ///////////////////
          // CONSOLES
          ///////////////////
          /(ouya)/i,
          // Ouya
          /(nintendo) ([wids3utch]+)/i
          // Nintendo
        ], [VENDOR, MODEL, [TYPE, CONSOLE]], [
          /droid.+; (shield) bui/i
          // Nvidia
        ], [MODEL, [VENDOR, "Nvidia"], [TYPE, CONSOLE]], [
          /(playstation [345portablevi]+)/i
          // Playstation
        ], [MODEL, [VENDOR, SONY], [TYPE, CONSOLE]], [
          /\b(xbox(?: one)?(?!; xbox))[\); ]/i
          // Microsoft Xbox
        ], [MODEL, [VENDOR, MICROSOFT], [TYPE, CONSOLE]], [
          ///////////////////
          // WEARABLES
          ///////////////////
          /\b(sm-[lr]\d\d[05][fnuw]?s?)\b/i
          // Samsung Galaxy Watch
        ], [MODEL, [VENDOR, SAMSUNG], [TYPE, WEARABLE]], [
          /((pebble))app/i
          // Pebble
        ], [VENDOR, MODEL, [TYPE, WEARABLE]], [
          /(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i
          // Apple Watch
        ], [MODEL, [VENDOR, APPLE], [TYPE, WEARABLE]], [
          /droid.+; (glass) \d/i
          // Google Glass
        ], [MODEL, [VENDOR, GOOGLE], [TYPE, WEARABLE]], [/droid.+; (wt63?0{2,3})\)/i], [MODEL, [VENDOR, ZEBRA], [TYPE, WEARABLE]], [
          ///////////////////
          // XR
          ///////////////////
          /droid.+; (glass) \d/i
          // Google Glass
        ], [MODEL, [VENDOR, GOOGLE], [TYPE, WEARABLE]], [
          /(pico) (4|neo3(?: link|pro)?)/i
          // Pico
        ], [VENDOR, MODEL, [TYPE, WEARABLE]], [
          /; (quest( \d| pro)?)/i
          // Oculus Quest
        ], [MODEL, [VENDOR, FACEBOOK], [TYPE, WEARABLE]], [
          ///////////////////
          // EMBEDDED
          ///////////////////
          /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i
          // Tesla
        ], [VENDOR, [TYPE, EMBEDDED]], [
          /(aeobc)\b/i
          // Echo Dot
        ], [MODEL, [VENDOR, AMAZON], [TYPE, EMBEDDED]], [
          ////////////////////
          // MIXED (GENERIC)
          ///////////////////
          /droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i
          // Android Phones from Unidentified Vendors
        ], [MODEL, [TYPE, MOBILE]], [
          /droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i
          // Android Tablets from Unidentified Vendors
        ], [MODEL, [TYPE, TABLET]], [
          /\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i
          // Unidentifiable Tablet
        ], [[TYPE, TABLET]], [
          /(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i
          // Unidentifiable Mobile
        ], [[TYPE, MOBILE]], [
          /(android[-\w\. ]{0,9});.+buil/i
          // Generic Android Device
        ], [MODEL, [VENDOR, "Generic"]]],
        engine: [[
          /windows.+ edge\/([\w\.]+)/i
          // EdgeHTML
        ], [VERSION, [NAME, EDGE + "HTML"]], [
          /(arkweb)\/([\w\.]+)/i
          // ArkWeb
        ], [NAME, VERSION], [
          /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i
          // Blink
        ], [VERSION, [NAME, "Blink"]], [
          /(presto)\/([\w\.]+)/i,
          // Presto
          /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna|servo)\/([\w\.]+)/i,
          // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna/Servo
          /ekioh(flow)\/([\w\.]+)/i,
          // Flow
          /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,
          // KHTML/Tasman/Links
          /(icab)[\/ ]([23]\.[\d\.]+)/i,
          // iCab
          /\b(libweb)/i
        ], [NAME, VERSION], [
          /rv\:([\w\.]{1,9})\b.+(gecko)/i
          // Gecko
        ], [VERSION, NAME]],
        os: [[
          // Windows
          /microsoft (windows) (vista|xp)/i
          // Windows (iTunes)
        ], [NAME, VERSION], [
          /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i
          // Windows Phone
        ], [NAME, [VERSION, strMapper, windowsVersionMap]], [
          /windows nt 6\.2; (arm)/i,
          // Windows RT
          /windows[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i,
          /(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i
        ], [[VERSION, strMapper, windowsVersionMap], [NAME, "Windows"]], [
          // iOS/macOS
          /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,
          // iOS
          /(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
          /cfnetwork\/.+darwin/i
        ], [[VERSION, /_/g, "."], [NAME, "iOS"]], [
          /(mac os x) ?([\w\. ]*)/i,
          /(macintosh|mac_powerpc\b)(?!.+haiku)/i
          // Mac OS
        ], [[NAME, MAC_OS], [VERSION, /_/g, "."]], [
          // Mobile OSes
          /droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i
          // Android-x86/HarmonyOS
        ], [VERSION, NAME], [
          // Android/WebOS/QNX/Bada/RIM/Maemo/MeeGo/Sailfish OS/OpenHarmony
          /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish|openharmony)[-\/ ]?([\w\.]*)/i,
          /(blackberry)\w*\/([\w\.]*)/i,
          // Blackberry
          /(tizen|kaios)[\/ ]([\w\.]+)/i,
          // Tizen/KaiOS
          /\((series40);/i
          // Series 40
        ], [NAME, VERSION], [
          /\(bb(10);/i
          // BlackBerry 10
        ], [VERSION, [NAME, BLACKBERRY]], [
          /(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i
          // Symbian
        ], [VERSION, [NAME, "Symbian"]], [
          /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i
          // Firefox OS
        ], [VERSION, [NAME, FIREFOX + " OS"]], [
          /web0s;.+rt(tv)/i,
          /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i
          // WebOS
        ], [VERSION, [NAME, "webOS"]], [
          /watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i
          // watchOS
        ], [VERSION, [NAME, "watchOS"]], [
          // Google Chromecast
          /crkey\/([\d\.]+)/i
          // Google Chromecast
        ], [VERSION, [NAME, CHROME + "cast"]], [
          /(cros) [\w]+(?:\)| ([\w\.]+)\b)/i
          // Chromium OS
        ], [[NAME, CHROMIUM_OS], VERSION], [
          // Smart TVs
          /panasonic;(viera)/i,
          // Panasonic Viera
          /(netrange)mmh/i,
          // Netrange
          /(nettv)\/(\d+\.[\w\.]+)/i,
          // NetTV
          // Console
          /(nintendo|playstation) ([wids345portablevuch]+)/i,
          // Nintendo/Playstation
          /(xbox); +xbox ([^\);]+)/i,
          // Microsoft Xbox (360, One, X, S, Series X, Series S)
          // Other
          /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,
          // Joli/Palm
          /(mint)[\/\(\) ]?(\w*)/i,
          // Mint
          /(mageia|vectorlinux)[; ]/i,
          // Mageia/VectorLinux
          /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
          // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
          /(hurd|linux) ?([\w\.]*)/i,
          // Hurd/Linux
          /(gnu) ?([\w\.]*)/i,
          // GNU
          /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,
          // FreeBSD/NetBSD/OpenBSD/PC-BSD/GhostBSD/DragonFly
          /(haiku) (\w+)/i
          // Haiku
        ], [NAME, VERSION], [
          /(sunos) ?([\w\.\d]*)/i
          // Solaris
        ], [[NAME, "Solaris"], VERSION], [
          /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,
          // Solaris
          /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,
          // AIX
          /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
          // BeOS/OS2/AmigaOS/MorphOS/OpenVMS/Fuchsia/HP-UX/SerenityOS
          /(unix) ?([\w\.]*)/i
          // UNIX
        ], [NAME, VERSION]]
      };
      var UAParser2 = function(ua, extensions) {
        if (typeof ua === OBJ_TYPE) {
          extensions = ua;
          ua = undefined2;
        }
        if (!(this instanceof UAParser2)) {
          return new UAParser2(ua, extensions).getResult();
        }
        var _navigator = typeof window2 !== UNDEF_TYPE && window2.navigator ? window2.navigator : undefined2;
        var _ua = ua || (_navigator && _navigator.userAgent ? _navigator.userAgent : EMPTY);
        var _uach = _navigator && _navigator.userAgentData ? _navigator.userAgentData : undefined2;
        var _rgxmap = extensions ? extend(regexes, extensions) : regexes;
        var _isSelfNav = _navigator && _navigator.userAgent == _ua;
        this.getBrowser = function() {
          var _browser = {};
          _browser[NAME] = undefined2;
          _browser[VERSION] = undefined2;
          rgxMapper.call(_browser, _ua, _rgxmap.browser);
          _browser[MAJOR] = majorize(_browser[VERSION]);
          if (_isSelfNav && _navigator && _navigator.brave && typeof _navigator.brave.isBrave == FUNC_TYPE) {
            _browser[NAME] = "Brave";
          }
          return _browser;
        };
        this.getCPU = function() {
          var _cpu = {};
          _cpu[ARCHITECTURE] = undefined2;
          rgxMapper.call(_cpu, _ua, _rgxmap.cpu);
          return _cpu;
        };
        this.getDevice = function() {
          var _device = {};
          _device[VENDOR] = undefined2;
          _device[MODEL] = undefined2;
          _device[TYPE] = undefined2;
          rgxMapper.call(_device, _ua, _rgxmap.device);
          if (_isSelfNav && !_device[TYPE] && _uach && _uach.mobile) {
            _device[TYPE] = MOBILE;
          }
          if (_isSelfNav && _device[MODEL] == "Macintosh" && _navigator && typeof _navigator.standalone !== UNDEF_TYPE && _navigator.maxTouchPoints && _navigator.maxTouchPoints > 2) {
            _device[MODEL] = "iPad";
            _device[TYPE] = TABLET;
          }
          return _device;
        };
        this.getEngine = function() {
          var _engine = {};
          _engine[NAME] = undefined2;
          _engine[VERSION] = undefined2;
          rgxMapper.call(_engine, _ua, _rgxmap.engine);
          return _engine;
        };
        this.getOS = function() {
          var _os = {};
          _os[NAME] = undefined2;
          _os[VERSION] = undefined2;
          rgxMapper.call(_os, _ua, _rgxmap.os);
          if (_isSelfNav && !_os[NAME] && _uach && _uach.platform && _uach.platform != "Unknown") {
            _os[NAME] = _uach.platform.replace(/chrome os/i, CHROMIUM_OS).replace(/macos/i, MAC_OS);
          }
          return _os;
        };
        this.getResult = function() {
          return {
            ua: this.getUA(),
            browser: this.getBrowser(),
            engine: this.getEngine(),
            os: this.getOS(),
            device: this.getDevice(),
            cpu: this.getCPU()
          };
        };
        this.getUA = function() {
          return _ua;
        };
        this.setUA = function(ua2) {
          _ua = typeof ua2 === STR_TYPE && ua2.length > UA_MAX_LENGTH ? trim(ua2, UA_MAX_LENGTH) : ua2;
          return this;
        };
        this.setUA(_ua);
        return this;
      };
      UAParser2.VERSION = LIBVERSION;
      UAParser2.BROWSER = enumerize([NAME, VERSION, MAJOR]);
      UAParser2.CPU = enumerize([ARCHITECTURE]);
      UAParser2.DEVICE = enumerize([MODEL, VENDOR, TYPE, CONSOLE, MOBILE, SMARTTV, TABLET, WEARABLE, EMBEDDED]);
      UAParser2.ENGINE = UAParser2.OS = enumerize([NAME, VERSION]);
      if (typeof exports !== UNDEF_TYPE) {
        if (typeof module !== UNDEF_TYPE && module.exports) {
          exports = module.exports = UAParser2;
        }
        exports.UAParser = UAParser2;
      } else {
        if (typeof define === FUNC_TYPE && define.amd) {
          define(function() {
            return UAParser2;
          });
        } else if (typeof window2 !== UNDEF_TYPE) {
          window2.UAParser = UAParser2;
        }
      }
      var $ = typeof window2 !== UNDEF_TYPE && (window2.jQuery || window2.Zepto);
      if ($ && !$.ua) {
        var parser = new UAParser2();
        $.ua = parser.getResult();
        $.ua.get = function() {
          return parser.getUA();
        };
        $.ua.set = function(ua) {
          parser.setUA(ua);
          var result = parser.getResult();
          for (var prop in result) {
            $.ua[prop] = result[prop];
          }
        };
      }
    })(typeof window === "object" ? window : exports);
  }
});

// node_modules/sdp-transform/lib/grammar.js
var require_grammar = __commonJS({
  "node_modules/sdp-transform/lib/grammar.js"(exports, module) {
    var grammar = module.exports = {
      v: [{
        name: "version",
        reg: /^(\d*)$/
      }],
      o: [{
        // o=- 20518 0 IN IP4 203.0.113.1
        // NB: sessionId will be a String in most cases because it is huge
        name: "origin",
        reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
        names: ["username", "sessionId", "sessionVersion", "netType", "ipVer", "address"],
        format: "%s %s %d %s IP%d %s"
      }],
      // default parsing of these only (though some of these feel outdated)
      s: [{
        name: "name"
      }],
      i: [{
        name: "description"
      }],
      u: [{
        name: "uri"
      }],
      e: [{
        name: "email"
      }],
      p: [{
        name: "phone"
      }],
      z: [{
        name: "timezones"
      }],
      // TODO: this one can actually be parsed properly...
      r: [{
        name: "repeats"
      }],
      // TODO: this one can also be parsed properly
      // k: [{}], // outdated thing ignored
      t: [{
        // t=0 0
        name: "timing",
        reg: /^(\d*) (\d*)/,
        names: ["start", "stop"],
        format: "%d %d"
      }],
      c: [{
        // c=IN IP4 10.47.197.26
        name: "connection",
        reg: /^IN IP(\d) (\S*)/,
        names: ["version", "ip"],
        format: "IN IP%d %s"
      }],
      b: [{
        // b=AS:4000
        push: "bandwidth",
        reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
        names: ["type", "limit"],
        format: "%s:%s"
      }],
      m: [{
        // m=video 51744 RTP/AVP 126 97 98 34 31
        // NB: special - pushes to session
        // TODO: rtp/fmtp should be filtered by the payloads found here?
        reg: /^(\w*) (\d*) ([\w/]*)(?: (.*))?/,
        names: ["type", "port", "protocol", "payloads"],
        format: "%s %d %s %s"
      }],
      a: [
        {
          // a=rtpmap:110 opus/48000/2
          push: "rtp",
          reg: /^rtpmap:(\d*) ([\w\-.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
          names: ["payload", "codec", "rate", "encoding"],
          format: function(o) {
            return o.encoding ? "rtpmap:%d %s/%s/%s" : o.rate ? "rtpmap:%d %s/%s" : "rtpmap:%d %s";
          }
        },
        {
          // a=fmtp:108 profile-level-id=24;object=23;bitrate=64000
          // a=fmtp:111 minptime=10; useinbandfec=1
          push: "fmtp",
          reg: /^fmtp:(\d*) ([\S| ]*)/,
          names: ["payload", "config"],
          format: "fmtp:%d %s"
        },
        {
          // a=control:streamid=0
          name: "control",
          reg: /^control:(.*)/,
          format: "control:%s"
        },
        {
          // a=rtcp:65179 IN IP4 193.84.77.194
          name: "rtcp",
          reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
          names: ["port", "netType", "ipVer", "address"],
          format: function(o) {
            return o.address != null ? "rtcp:%d %s IP%d %s" : "rtcp:%d";
          }
        },
        {
          // a=rtcp-fb:98 trr-int 100
          push: "rtcpFbTrrInt",
          reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
          names: ["payload", "value"],
          format: "rtcp-fb:%s trr-int %d"
        },
        {
          // a=rtcp-fb:98 nack rpsi
          push: "rtcpFb",
          reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
          names: ["payload", "type", "subtype"],
          format: function(o) {
            return o.subtype != null ? "rtcp-fb:%s %s %s" : "rtcp-fb:%s %s";
          }
        },
        {
          // a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
          // a=extmap:1/recvonly URI-gps-string
          // a=extmap:3 urn:ietf:params:rtp-hdrext:encrypt urn:ietf:params:rtp-hdrext:smpte-tc 25@600/24
          push: "ext",
          reg: /^extmap:(\d+)(?:\/(\w+))?(?: (urn:ietf:params:rtp-hdrext:encrypt))? (\S*)(?: (\S*))?/,
          names: ["value", "direction", "encrypt-uri", "uri", "config"],
          format: function(o) {
            return "extmap:%d" + (o.direction ? "/%s" : "%v") + (o["encrypt-uri"] ? " %s" : "%v") + " %s" + (o.config ? " %s" : "");
          }
        },
        {
          // a=extmap-allow-mixed
          name: "extmapAllowMixed",
          reg: /^(extmap-allow-mixed)/
        },
        {
          // a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:PS1uQCVeeCFCanVmcjkpPywjNWhcYD0mXXtxaVBR|2^20|1:32
          push: "crypto",
          reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
          names: ["id", "suite", "config", "sessionConfig"],
          format: function(o) {
            return o.sessionConfig != null ? "crypto:%d %s %s %s" : "crypto:%d %s %s";
          }
        },
        {
          // a=setup:actpass
          name: "setup",
          reg: /^setup:(\w*)/,
          format: "setup:%s"
        },
        {
          // a=connection:new
          name: "connectionType",
          reg: /^connection:(new|existing)/,
          format: "connection:%s"
        },
        {
          // a=mid:1
          name: "mid",
          reg: /^mid:([^\s]*)/,
          format: "mid:%s"
        },
        {
          // a=msid:0c8b064d-d807-43b4-b434-f92a889d8587 98178685-d409-46e0-8e16-7ef0db0db64a
          name: "msid",
          reg: /^msid:(.*)/,
          format: "msid:%s"
        },
        {
          // a=ptime:20
          name: "ptime",
          reg: /^ptime:(\d*(?:\.\d*)*)/,
          format: "ptime:%d"
        },
        {
          // a=maxptime:60
          name: "maxptime",
          reg: /^maxptime:(\d*(?:\.\d*)*)/,
          format: "maxptime:%d"
        },
        {
          // a=sendrecv
          name: "direction",
          reg: /^(sendrecv|recvonly|sendonly|inactive)/
        },
        {
          // a=ice-lite
          name: "icelite",
          reg: /^(ice-lite)/
        },
        {
          // a=ice-ufrag:F7gI
          name: "iceUfrag",
          reg: /^ice-ufrag:(\S*)/,
          format: "ice-ufrag:%s"
        },
        {
          // a=ice-pwd:x9cml/YzichV2+XlhiMu8g
          name: "icePwd",
          reg: /^ice-pwd:(\S*)/,
          format: "ice-pwd:%s"
        },
        {
          // a=fingerprint:SHA-1 00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33
          name: "fingerprint",
          reg: /^fingerprint:(\S*) (\S*)/,
          names: ["type", "hash"],
          format: "fingerprint:%s %s"
        },
        {
          // a=candidate:0 1 UDP 2113667327 203.0.113.1 54400 typ host
          // a=candidate:1162875081 1 udp 2113937151 192.168.34.75 60017 typ host generation 0 network-id 3 network-cost 10
          // a=candidate:3289912957 2 udp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 generation 0 network-id 3 network-cost 10
          // a=candidate:229815620 1 tcp 1518280447 192.168.150.19 60017 typ host tcptype active generation 0 network-id 3 network-cost 10
          // a=candidate:3289912957 2 tcp 1845501695 193.84.77.194 60017 typ srflx raddr 192.168.34.75 rport 60017 tcptype passive generation 0 network-id 3 network-cost 10
          push: "candidates",
          reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
          names: ["foundation", "component", "transport", "priority", "ip", "port", "type", "raddr", "rport", "tcptype", "generation", "network-id", "network-cost"],
          format: function(o) {
            var str = "candidate:%s %d %s %d %s %d typ %s";
            str += o.raddr != null ? " raddr %s rport %d" : "%v%v";
            str += o.tcptype != null ? " tcptype %s" : "%v";
            if (o.generation != null) {
              str += " generation %d";
            }
            str += o["network-id"] != null ? " network-id %d" : "%v";
            str += o["network-cost"] != null ? " network-cost %d" : "%v";
            return str;
          }
        },
        {
          // a=end-of-candidates (keep after the candidates line for readability)
          name: "endOfCandidates",
          reg: /^(end-of-candidates)/
        },
        {
          // a=remote-candidates:1 203.0.113.1 54400 2 203.0.113.1 54401 ...
          name: "remoteCandidates",
          reg: /^remote-candidates:(.*)/,
          format: "remote-candidates:%s"
        },
        {
          // a=ice-options:google-ice
          name: "iceOptions",
          reg: /^ice-options:(\S*)/,
          format: "ice-options:%s"
        },
        {
          // a=ssrc:2566107569 cname:t9YU8M1UxTF8Y1A1
          push: "ssrcs",
          reg: /^ssrc:(\d*) ([\w_-]*)(?::(.*))?/,
          names: ["id", "attribute", "value"],
          format: function(o) {
            var str = "ssrc:%d";
            if (o.attribute != null) {
              str += " %s";
              if (o.value != null) {
                str += ":%s";
              }
            }
            return str;
          }
        },
        {
          // a=ssrc-group:FEC 1 2
          // a=ssrc-group:FEC-FR 3004364195 1080772241
          push: "ssrcGroups",
          // token-char = %x21 / %x23-27 / %x2A-2B / %x2D-2E / %x30-39 / %x41-5A / %x5E-7E
          reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
          names: ["semantics", "ssrcs"],
          format: "ssrc-group:%s %s"
        },
        {
          // a=msid-semantic: WMS Jvlam5X3SX1OP6pn20zWogvaKJz5Hjf9OnlV
          name: "msidSemantic",
          reg: /^msid-semantic:\s?(\w*) (\S*)/,
          names: ["semantic", "token"],
          format: "msid-semantic: %s %s"
          // space after ':' is not accidental
        },
        {
          // a=group:BUNDLE audio video
          push: "groups",
          reg: /^group:(\w*) (.*)/,
          names: ["type", "mids"],
          format: "group:%s %s"
        },
        {
          // a=rtcp-mux
          name: "rtcpMux",
          reg: /^(rtcp-mux)/
        },
        {
          // a=rtcp-rsize
          name: "rtcpRsize",
          reg: /^(rtcp-rsize)/
        },
        {
          // a=sctpmap:5000 webrtc-datachannel 1024
          name: "sctpmap",
          reg: /^sctpmap:([\w_/]*) (\S*)(?: (\S*))?/,
          names: ["sctpmapNumber", "app", "maxMessageSize"],
          format: function(o) {
            return o.maxMessageSize != null ? "sctpmap:%s %s %s" : "sctpmap:%s %s";
          }
        },
        {
          // a=x-google-flag:conference
          name: "xGoogleFlag",
          reg: /^x-google-flag:([^\s]*)/,
          format: "x-google-flag:%s"
        },
        {
          // a=rid:1 send max-width=1280;max-height=720;max-fps=30;depend=0
          push: "rids",
          reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
          names: ["id", "direction", "params"],
          format: function(o) {
            return o.params ? "rid:%s %s %s" : "rid:%s %s";
          }
        },
        {
          // a=imageattr:97 send [x=800,y=640,sar=1.1,q=0.6] [x=480,y=320] recv [x=330,y=250]
          // a=imageattr:* send [x=800,y=640] recv *
          // a=imageattr:100 recv [x=320,y=240]
          push: "imageattrs",
          reg: new RegExp(
            // a=imageattr:97
            "^imageattr:(\\d+|\\*)[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?"
          ),
          names: ["pt", "dir1", "attrs1", "dir2", "attrs2"],
          format: function(o) {
            return "imageattr:%s %s %s" + (o.dir2 ? " %s %s" : "");
          }
        },
        {
          // a=simulcast:send 1,2,3;~4,~5 recv 6;~7,~8
          // a=simulcast:recv 1;4,5 send 6;7
          name: "simulcast",
          reg: new RegExp(
            // a=simulcast:
            "^simulcast:(send|recv) ([a-zA-Z0-9\\-_~;,]+)(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?$"
          ),
          names: ["dir1", "list1", "dir2", "list2"],
          format: function(o) {
            return "simulcast:%s %s" + (o.dir2 ? " %s %s" : "");
          }
        },
        {
          // old simulcast draft 03 (implemented by Firefox)
          //   https://tools.ietf.org/html/draft-ietf-mmusic-sdp-simulcast-03
          // a=simulcast: recv pt=97;98 send pt=97
          // a=simulcast: send rid=5;6;7 paused=6,7
          name: "simulcast_03",
          reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
          names: ["value"],
          format: "simulcast: %s"
        },
        {
          // a=framerate:25
          // a=framerate:29.97
          name: "framerate",
          reg: /^framerate:(\d+(?:$|\.\d+))/,
          format: "framerate:%s"
        },
        {
          // RFC4570
          // a=source-filter: incl IN IP4 239.5.2.31 10.1.15.5
          name: "sourceFilter",
          reg: /^source-filter: *(excl|incl) (\S*) (IP4|IP6|\*) (\S*) (.*)/,
          names: ["filterMode", "netType", "addressTypes", "destAddress", "srcList"],
          format: "source-filter: %s %s %s %s %s"
        },
        {
          // a=bundle-only
          name: "bundleOnly",
          reg: /^(bundle-only)/
        },
        {
          // a=label:1
          name: "label",
          reg: /^label:(.+)/,
          format: "label:%s"
        },
        {
          // RFC version 26 for SCTP over DTLS
          // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-5
          name: "sctpPort",
          reg: /^sctp-port:(\d+)$/,
          format: "sctp-port:%s"
        },
        {
          // RFC version 26 for SCTP over DTLS
          // https://tools.ietf.org/html/draft-ietf-mmusic-sctp-sdp-26#section-6
          name: "maxMessageSize",
          reg: /^max-message-size:(\d+)$/,
          format: "max-message-size:%s"
        },
        {
          // RFC7273
          // a=ts-refclk:ptp=IEEE1588-2008:39-A7-94-FF-FE-07-CB-D0:37
          push: "tsRefClocks",
          reg: /^ts-refclk:([^\s=]*)(?:=(\S*))?/,
          names: ["clksrc", "clksrcExt"],
          format: function(o) {
            return "ts-refclk:%s" + (o.clksrcExt != null ? "=%s" : "");
          }
        },
        {
          // RFC7273
          // a=mediaclk:direct=963214424
          name: "mediaClk",
          reg: /^mediaclk:(?:id=(\S*))? *([^\s=]*)(?:=(\S*))?(?: *rate=(\d+)\/(\d+))?/,
          names: ["id", "mediaClockName", "mediaClockValue", "rateNumerator", "rateDenominator"],
          format: function(o) {
            var str = "mediaclk:";
            str += o.id != null ? "id=%s %s" : "%v%s";
            str += o.mediaClockValue != null ? "=%s" : "";
            str += o.rateNumerator != null ? " rate=%s" : "";
            str += o.rateDenominator != null ? "/%s" : "";
            return str;
          }
        },
        {
          // a=keywds:keywords
          name: "keywords",
          reg: /^keywds:(.+)$/,
          format: "keywds:%s"
        },
        {
          // a=content:main
          name: "content",
          reg: /^content:(.+)/,
          format: "content:%s"
        },
        // BFCP https://tools.ietf.org/html/rfc4583
        {
          // a=floorctrl:c-s
          name: "bfcpFloorCtrl",
          reg: /^floorctrl:(c-only|s-only|c-s)/,
          format: "floorctrl:%s"
        },
        {
          // a=confid:1
          name: "bfcpConfId",
          reg: /^confid:(\d+)/,
          format: "confid:%s"
        },
        {
          // a=userid:1
          name: "bfcpUserId",
          reg: /^userid:(\d+)/,
          format: "userid:%s"
        },
        {
          // a=floorid:1
          name: "bfcpFloorId",
          reg: /^floorid:(.+) (?:m-stream|mstrm):(.+)/,
          names: ["id", "mStream"],
          format: "floorid:%s mstrm:%s"
        },
        {
          // any a= that we don't understand is kept verbatim on media.invalid
          push: "invalid",
          names: ["value"]
        }
      ]
    };
    Object.keys(grammar).forEach(function(key) {
      var objs = grammar[key];
      objs.forEach(function(obj) {
        if (!obj.reg) {
          obj.reg = /(.*)/;
        }
        if (!obj.format) {
          obj.format = "%s";
        }
      });
    });
  }
});

// node_modules/sdp-transform/lib/parser.js
var require_parser = __commonJS({
  "node_modules/sdp-transform/lib/parser.js"(exports) {
    var toIntIfInt = function(v) {
      return String(Number(v)) === v ? Number(v) : v;
    };
    var attachProperties = function(match, location, names, rawName) {
      if (rawName && !names) {
        location[rawName] = toIntIfInt(match[1]);
      } else {
        for (var i = 0; i < names.length; i += 1) {
          if (match[i + 1] != null) {
            location[names[i]] = toIntIfInt(match[i + 1]);
          }
        }
      }
    };
    var parseReg = function(obj, location, content) {
      var needsBlank = obj.name && obj.names;
      if (obj.push && !location[obj.push]) {
        location[obj.push] = [];
      } else if (needsBlank && !location[obj.name]) {
        location[obj.name] = {};
      }
      var keyLocation = obj.push ? {} : (
        // blank object that will be pushed
        needsBlank ? location[obj.name] : location
      );
      attachProperties(content.match(obj.reg), keyLocation, obj.names, obj.name);
      if (obj.push) {
        location[obj.push].push(keyLocation);
      }
    };
    var grammar = require_grammar();
    var validLine = RegExp.prototype.test.bind(/^([a-z])=(.*)/);
    exports.parse = function(sdp2) {
      var session = {}, media = [], location = session;
      sdp2.split(/(\r\n|\r|\n)/).filter(validLine).forEach(function(l) {
        var type = l[0];
        var content = l.slice(2);
        if (type === "m") {
          media.push({
            rtp: [],
            fmtp: []
          });
          location = media[media.length - 1];
        }
        for (var j = 0; j < (grammar[type] || []).length; j += 1) {
          var obj = grammar[type][j];
          if (obj.reg.test(content)) {
            return parseReg(obj, location, content);
          }
        }
      });
      session.media = media;
      return session;
    };
    var paramReducer = function(acc, expr) {
      var s = expr.split(/=(.+)/, 2);
      if (s.length === 2) {
        acc[s[0]] = toIntIfInt(s[1]);
      } else if (s.length === 1 && expr.length > 1) {
        acc[s[0]] = void 0;
      }
      return acc;
    };
    exports.parseParams = function(str) {
      return str.split(/;\s?/).reduce(paramReducer, {});
    };
    exports.parseFmtpConfig = exports.parseParams;
    exports.parsePayloads = function(str) {
      return str.toString().split(" ").map(Number);
    };
    exports.parseRemoteCandidates = function(str) {
      var candidates = [];
      var parts = str.split(" ").map(toIntIfInt);
      for (var i = 0; i < parts.length; i += 3) {
        candidates.push({
          component: parts[i],
          ip: parts[i + 1],
          port: parts[i + 2]
        });
      }
      return candidates;
    };
    exports.parseImageAttributes = function(str) {
      return str.split(" ").map(function(item) {
        return item.substring(1, item.length - 1).split(",").reduce(paramReducer, {});
      });
    };
    exports.parseSimulcastStreamList = function(str) {
      return str.split(";").map(function(stream) {
        return stream.split(",").map(function(format) {
          var scid, paused = false;
          if (format[0] !== "~") {
            scid = toIntIfInt(format);
          } else {
            scid = toIntIfInt(format.substring(1, format.length));
            paused = true;
          }
          return {
            scid,
            paused
          };
        });
      });
    };
  }
});

// node_modules/sdp-transform/lib/writer.js
var require_writer = __commonJS({
  "node_modules/sdp-transform/lib/writer.js"(exports, module) {
    var grammar = require_grammar();
    var formatRegExp = /%[sdv%]/g;
    var format = function(formatStr) {
      var i = 1;
      var args = arguments;
      var len = args.length;
      return formatStr.replace(formatRegExp, function(x) {
        if (i >= len) {
          return x;
        }
        var arg = args[i];
        i += 1;
        switch (x) {
          case "%%":
            return "%";
          case "%s":
            return String(arg);
          case "%d":
            return Number(arg);
          case "%v":
            return "";
        }
      });
    };
    var makeLine = function(type, obj, location) {
      var str = obj.format instanceof Function ? obj.format(obj.push ? location : location[obj.name]) : obj.format;
      var args = [type + "=" + str];
      if (obj.names) {
        for (var i = 0; i < obj.names.length; i += 1) {
          var n = obj.names[i];
          if (obj.name) {
            args.push(location[obj.name][n]);
          } else {
            args.push(location[obj.names[i]]);
          }
        }
      } else {
        args.push(location[obj.name]);
      }
      return format.apply(null, args);
    };
    var defaultOuterOrder = ["v", "o", "s", "i", "u", "e", "p", "c", "b", "t", "r", "z", "a"];
    var defaultInnerOrder = ["i", "c", "b", "a"];
    module.exports = function(session, opts) {
      opts = opts || {};
      if (session.version == null) {
        session.version = 0;
      }
      if (session.name == null) {
        session.name = " ";
      }
      session.media.forEach(function(mLine) {
        if (mLine.payloads == null) {
          mLine.payloads = "";
        }
      });
      var outerOrder = opts.outerOrder || defaultOuterOrder;
      var innerOrder = opts.innerOrder || defaultInnerOrder;
      var sdp2 = [];
      outerOrder.forEach(function(type) {
        grammar[type].forEach(function(obj) {
          if (obj.name in session && session[obj.name] != null) {
            sdp2.push(makeLine(type, obj, session));
          } else if (obj.push in session && session[obj.push] != null) {
            session[obj.push].forEach(function(el) {
              sdp2.push(makeLine(type, obj, el));
            });
          }
        });
      });
      session.media.forEach(function(mLine) {
        sdp2.push(makeLine("m", grammar.m[0], mLine));
        innerOrder.forEach(function(type) {
          grammar[type].forEach(function(obj) {
            if (obj.name in mLine && mLine[obj.name] != null) {
              sdp2.push(makeLine(type, obj, mLine));
            } else if (obj.push in mLine && mLine[obj.push] != null) {
              mLine[obj.push].forEach(function(el) {
                sdp2.push(makeLine(type, obj, el));
              });
            }
          });
        });
      });
      return sdp2.join("\r\n") + "\r\n";
    };
  }
});

// node_modules/sdp-transform/lib/index.js
var require_lib = __commonJS({
  "node_modules/sdp-transform/lib/index.js"(exports) {
    var parser = require_parser();
    var writer = require_writer();
    var grammar = require_grammar();
    exports.grammar = grammar;
    exports.write = writer;
    exports.parse = parser.parse;
    exports.parseParams = parser.parseParams;
    exports.parseFmtpConfig = parser.parseFmtpConfig;
    exports.parsePayloads = parser.parsePayloads;
    exports.parseRemoteCandidates = parser.parseRemoteCandidates;
    exports.parseImageAttributes = parser.parseImageAttributes;
    exports.parseSimulcastStreamList = parser.parseSimulcastStreamList;
  }
});

// node_modules/webrtc-adapter/src/js/utils.js
var logDisabled_ = true;
var deprecationWarnings_ = true;
function extractVersion(uastring, expr, pos) {
  const match = uastring.match(expr);
  return match && match.length >= pos && parseInt(match[pos], 10);
}
function wrapPeerConnectionEvent(window2, eventNameToWrap, wrapper) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  const nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    const wrappedCallback = (e) => {
      const modifiedEvent = wrapper(e);
      if (modifiedEvent) {
        if (cb.handleEvent) {
          cb.handleEvent(modifiedEvent);
        } else {
          cb(modifiedEvent);
        }
      }
    };
    this._eventMap = this._eventMap || {};
    if (!this._eventMap[eventNameToWrap]) {
      this._eventMap[eventNameToWrap] = /* @__PURE__ */ new Map();
    }
    this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
    return nativeAddEventListener.apply(this, [nativeEventName, wrappedCallback]);
  };
  const nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[eventNameToWrap]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    if (!this._eventMap[eventNameToWrap].has(cb)) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    const unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
    this._eventMap[eventNameToWrap].delete(cb);
    if (this._eventMap[eventNameToWrap].size === 0) {
      delete this._eventMap[eventNameToWrap];
    }
    if (Object.keys(this._eventMap).length === 0) {
      delete this._eventMap;
    }
    return nativeRemoveEventListener.apply(this, [nativeEventName, unwrappedCb]);
  };
  Object.defineProperty(proto, "on" + eventNameToWrap, {
    get() {
      return this["_on" + eventNameToWrap];
    },
    set(cb) {
      if (this["_on" + eventNameToWrap]) {
        this.removeEventListener(eventNameToWrap, this["_on" + eventNameToWrap]);
        delete this["_on" + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(eventNameToWrap, this["_on" + eventNameToWrap] = cb);
      }
    },
    enumerable: true,
    configurable: true
  });
}
function disableLog(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  logDisabled_ = bool;
  return bool ? "adapter.js logging disabled" : "adapter.js logging enabled";
}
function disableWarnings(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  deprecationWarnings_ = !bool;
  return "adapter.js deprecation warnings " + (bool ? "disabled" : "enabled");
}
function log() {
  if (typeof window === "object") {
    if (logDisabled_) {
      return;
    }
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log.apply(console, arguments);
    }
  }
}
function deprecated(oldMethod, newMethod) {
  if (!deprecationWarnings_) {
    return;
  }
  console.warn(oldMethod + " is deprecated, please use " + newMethod + " instead.");
}
function detectBrowser(window2) {
  const result = {
    browser: null,
    version: null
  };
  if (typeof window2 === "undefined" || !window2.navigator || !window2.navigator.userAgent) {
    result.browser = "Not a browser.";
    return result;
  }
  const {
    navigator: navigator2
  } = window2;
  if (navigator2.mozGetUserMedia) {
    result.browser = "firefox";
    result.version = extractVersion(navigator2.userAgent, /Firefox\/(\d+)\./, 1);
  } else if (navigator2.webkitGetUserMedia || window2.isSecureContext === false && window2.webkitRTCPeerConnection) {
    result.browser = "chrome";
    result.version = extractVersion(navigator2.userAgent, /Chrom(e|ium)\/(\d+)\./, 2);
  } else if (window2.RTCPeerConnection && navigator2.userAgent.match(/AppleWebKit\/(\d+)\./)) {
    result.browser = "safari";
    result.version = extractVersion(navigator2.userAgent, /AppleWebKit\/(\d+)\./, 1);
    result.supportsUnifiedPlan = window2.RTCRtpTransceiver && "currentDirection" in window2.RTCRtpTransceiver.prototype;
  } else {
    result.browser = "Not a supported browser.";
    return result;
  }
  return result;
}
function isObject(val) {
  return Object.prototype.toString.call(val) === "[object Object]";
}
function compactObject(data) {
  if (!isObject(data)) {
    return data;
  }
  return Object.keys(data).reduce(function(accumulator, key) {
    const isObj = isObject(data[key]);
    const value = isObj ? compactObject(data[key]) : data[key];
    const isEmptyObject = isObj && !Object.keys(value).length;
    if (value === void 0 || isEmptyObject) {
      return accumulator;
    }
    return Object.assign(accumulator, {
      [key]: value
    });
  }, {});
}
function walkStats(stats, base, resultSet) {
  if (!base || resultSet.has(base.id)) {
    return;
  }
  resultSet.set(base.id, base);
  Object.keys(base).forEach((name2) => {
    if (name2.endsWith("Id")) {
      walkStats(stats, stats.get(base[name2]), resultSet);
    } else if (name2.endsWith("Ids")) {
      base[name2].forEach((id) => {
        walkStats(stats, stats.get(id), resultSet);
      });
    }
  });
}
function filterStats(result, track, outbound) {
  const streamStatsType = outbound ? "outbound-rtp" : "inbound-rtp";
  const filteredResult = /* @__PURE__ */ new Map();
  if (track === null) {
    return filteredResult;
  }
  const trackStats = [];
  result.forEach((value) => {
    if (value.type === "track" && value.trackIdentifier === track.id) {
      trackStats.push(value);
    }
  });
  trackStats.forEach((trackStat) => {
    result.forEach((stats) => {
      if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
        walkStats(result, stats, filteredResult);
      }
    });
  });
  return filteredResult;
}

// node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
var chrome_shim_exports = {};
__export(chrome_shim_exports, {
  fixNegotiationNeeded: () => fixNegotiationNeeded,
  shimAddTrackRemoveTrack: () => shimAddTrackRemoveTrack,
  shimAddTrackRemoveTrackWithNative: () => shimAddTrackRemoveTrackWithNative,
  shimGetDisplayMedia: () => shimGetDisplayMedia,
  shimGetSendersWithDtmf: () => shimGetSendersWithDtmf,
  shimGetStats: () => shimGetStats,
  shimGetUserMedia: () => shimGetUserMedia,
  shimMediaStream: () => shimMediaStream,
  shimOnTrack: () => shimOnTrack,
  shimPeerConnection: () => shimPeerConnection,
  shimSenderReceiverGetStats: () => shimSenderReceiverGetStats
});

// node_modules/webrtc-adapter/src/js/chrome/getusermedia.js
var logging = log;
function shimGetUserMedia(window2, browserDetails) {
  const navigator2 = window2 && window2.navigator;
  if (!navigator2.mediaDevices) {
    return;
  }
  const constraintsToChrome_ = function(c) {
    if (typeof c !== "object" || c.mandatory || c.optional) {
      return c;
    }
    const cc = {};
    Object.keys(c).forEach((key) => {
      if (key === "require" || key === "advanced" || key === "mediaSource") {
        return;
      }
      const r = typeof c[key] === "object" ? c[key] : {
        ideal: c[key]
      };
      if (r.exact !== void 0 && typeof r.exact === "number") {
        r.min = r.max = r.exact;
      }
      const oldname_ = function(prefix, name2) {
        if (prefix) {
          return prefix + name2.charAt(0).toUpperCase() + name2.slice(1);
        }
        return name2 === "deviceId" ? "sourceId" : name2;
      };
      if (r.ideal !== void 0) {
        cc.optional = cc.optional || [];
        let oc = {};
        if (typeof r.ideal === "number") {
          oc[oldname_("min", key)] = r.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_("max", key)] = r.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_("", key)] = r.ideal;
          cc.optional.push(oc);
        }
      }
      if (r.exact !== void 0 && typeof r.exact !== "number") {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_("", key)] = r.exact;
      } else {
        ["min", "max"].forEach((mix) => {
          if (r[mix] !== void 0) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };
  const shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === "object") {
      const remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, "autoGainControl", "googAutoGainControl");
      remap(constraints.audio, "noiseSuppression", "googNoiseSuppression");
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === "object") {
      let face = constraints.video.facingMode;
      face = face && (typeof face === "object" ? face : {
        ideal: face
      });
      const getSupportedFacingModeLies = browserDetails.version < 66;
      if (face && (face.exact === "user" || face.exact === "environment" || face.ideal === "user" || face.ideal === "environment") && !(navigator2.mediaDevices.getSupportedConstraints && navigator2.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        let matches;
        if (face.exact === "environment" || face.ideal === "environment") {
          matches = ["back", "rear"];
        } else if (face.exact === "user" || face.ideal === "user") {
          matches = ["front"];
        }
        if (matches) {
          return navigator2.mediaDevices.enumerateDevices().then((devices) => {
            devices = devices.filter((d) => d.kind === "videoinput");
            let dev = devices.find((d) => matches.some((match) => d.label.toLowerCase().includes(match)));
            if (!dev && devices.length && matches.includes("back")) {
              dev = devices[devices.length - 1];
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? {
                exact: dev.deviceId
              } : {
                ideal: dev.deviceId
              };
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging("chrome: " + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging("chrome: " + JSON.stringify(constraints));
    return func(constraints);
  };
  const shimError_ = function(e) {
    if (browserDetails.version >= 64) {
      return e;
    }
    return {
      name: {
        PermissionDeniedError: "NotAllowedError",
        PermissionDismissedError: "NotAllowedError",
        InvalidStateError: "NotAllowedError",
        DevicesNotFoundError: "NotFoundError",
        ConstraintNotSatisfiedError: "OverconstrainedError",
        TrackStartError: "NotReadableError",
        MediaDeviceFailedDueToShutdown: "NotAllowedError",
        MediaDeviceKillSwitchOn: "NotAllowedError",
        TabCaptureError: "AbortError",
        ScreenCaptureError: "AbortError",
        DeviceCaptureError: "AbortError"
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraint || e.constraintName,
      toString() {
        return this.name + (this.message && ": ") + this.message;
      }
    };
  };
  const getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, (c) => {
      navigator2.webkitGetUserMedia(c, onSuccess, (e) => {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };
  navigator2.getUserMedia = getUserMedia_.bind(navigator2);
  if (navigator2.mediaDevices.getUserMedia) {
    const origGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, (c) => origGetUserMedia(c).then((stream) => {
        if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          throw new DOMException("", "NotFoundError");
        }
        return stream;
      }, (e) => Promise.reject(shimError_(e))));
    };
  }
}

// node_modules/webrtc-adapter/src/js/chrome/getdisplaymedia.js
function shimGetDisplayMedia(window2, getSourceId) {
  if (window2.navigator.mediaDevices && "getDisplayMedia" in window2.navigator.mediaDevices) {
    return;
  }
  if (!window2.navigator.mediaDevices) {
    return;
  }
  if (typeof getSourceId !== "function") {
    console.error("shimGetDisplayMedia: getSourceId argument is not a function");
    return;
  }
  window2.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
    return getSourceId(constraints).then((sourceId) => {
      const widthSpecified = constraints.video && constraints.video.width;
      const heightSpecified = constraints.video && constraints.video.height;
      const frameRateSpecified = constraints.video && constraints.video.frameRate;
      constraints.video = {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: sourceId,
          maxFrameRate: frameRateSpecified || 3
        }
      };
      if (widthSpecified) {
        constraints.video.mandatory.maxWidth = widthSpecified;
      }
      if (heightSpecified) {
        constraints.video.mandatory.maxHeight = heightSpecified;
      }
      return window2.navigator.mediaDevices.getUserMedia(constraints);
    });
  };
}

// node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
function shimMediaStream(window2) {
  window2.MediaStream = window2.MediaStream || window2.webkitMediaStream;
}
function shimOnTrack(window2) {
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("ontrack" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "ontrack", {
      get() {
        return this._ontrack;
      },
      set(f) {
        if (this._ontrack) {
          this.removeEventListener("track", this._ontrack);
        }
        this.addEventListener("track", this._ontrack = f);
      },
      enumerable: true,
      configurable: true
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      if (!this._ontrackpoly) {
        this._ontrackpoly = (e) => {
          e.stream.addEventListener("addtrack", (te) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r) => r.track && r.track.id === te.track.id);
            } else {
              receiver = {
                track: te.track
              };
            }
            const event = new Event("track");
            event.track = te.track;
            event.receiver = receiver;
            event.transceiver = {
              receiver
            };
            event.streams = [e.stream];
            this.dispatchEvent(event);
          });
          e.stream.getTracks().forEach((track) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r) => r.track && r.track.id === track.id);
            } else {
              receiver = {
                track
              };
            }
            const event = new Event("track");
            event.track = track;
            event.receiver = receiver;
            event.transceiver = {
              receiver
            };
            event.streams = [e.stream];
            this.dispatchEvent(event);
          });
        };
        this.addEventListener("addstream", this._ontrackpoly);
      }
      return origSetRemoteDescription.apply(this, arguments);
    };
  } else {
    wrapPeerConnectionEvent(window2, "track", (e) => {
      if (!e.transceiver) {
        Object.defineProperty(e, "transceiver", {
          value: {
            receiver: e.receiver
          }
        });
      }
      return e;
    });
  }
}
function shimGetSendersWithDtmf(window2) {
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("getSenders" in window2.RTCPeerConnection.prototype) && "createDTMFSender" in window2.RTCPeerConnection.prototype) {
    const shimSenderWithDtmf = function(pc, track) {
      return {
        track,
        get dtmf() {
          if (this._dtmf === void 0) {
            if (track.kind === "audio") {
              this._dtmf = pc.createDTMFSender(track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        },
        _pc: pc
      };
    };
    if (!window2.RTCPeerConnection.prototype.getSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        this._senders = this._senders || [];
        return this._senders.slice();
      };
      const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
      window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
        let sender = origAddTrack.apply(this, arguments);
        if (!sender) {
          sender = shimSenderWithDtmf(this, track);
          this._senders.push(sender);
        }
        return sender;
      };
      const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
      window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
        origRemoveTrack.apply(this, arguments);
        const idx = this._senders.indexOf(sender);
        if (idx !== -1) {
          this._senders.splice(idx, 1);
        }
      };
    }
    const origAddStream = window2.RTCPeerConnection.prototype.addStream;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._senders = this._senders || [];
      origAddStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        this._senders.push(shimSenderWithDtmf(this, track));
      });
    };
    const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._senders = this._senders || [];
      origRemoveStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        const sender = this._senders.find((s) => s.track === track);
        if (sender) {
          this._senders.splice(this._senders.indexOf(sender), 1);
        }
      });
    };
  } else if (typeof window2 === "object" && window2.RTCPeerConnection && "getSenders" in window2.RTCPeerConnection.prototype && "createDTMFSender" in window2.RTCPeerConnection.prototype && window2.RTCRtpSender && !("dtmf" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
    Object.defineProperty(window2.RTCRtpSender.prototype, "dtmf", {
      get() {
        if (this._dtmf === void 0) {
          if (this.track.kind === "audio") {
            this._dtmf = this._pc.createDTMFSender(this.track);
          } else {
            this._dtmf = null;
          }
        }
        return this._dtmf;
      }
    });
  }
}
function shimGetStats(window2) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const origGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;
    if (arguments.length > 0 && typeof selector === "function") {
      return origGetStats.apply(this, arguments);
    }
    if (origGetStats.length === 0 && (arguments.length === 0 || typeof selector !== "function")) {
      return origGetStats.apply(this, []);
    }
    const fixChromeStats_ = function(response) {
      const standardReport = {};
      const reports = response.result();
      reports.forEach((report) => {
        const standardStats = {
          id: report.id,
          timestamp: report.timestamp,
          type: {
            localcandidate: "local-candidate",
            remotecandidate: "remote-candidate"
          }[report.type] || report.type
        };
        report.names().forEach((name2) => {
          standardStats[name2] = report.stat(name2);
        });
        standardReport[standardStats.id] = standardStats;
      });
      return standardReport;
    };
    const makeMapStats = function(stats) {
      return new Map(Object.keys(stats).map((key) => [key, stats[key]]));
    };
    if (arguments.length >= 2) {
      const successCallbackWrapper_ = function(response) {
        onSucc(makeMapStats(fixChromeStats_(response)));
      };
      return origGetStats.apply(this, [successCallbackWrapper_, selector]);
    }
    return new Promise((resolve, reject) => {
      origGetStats.apply(this, [function(response) {
        resolve(makeMapStats(fixChromeStats_(response)));
      }, reject]);
    }).then(onSucc, onErr);
  };
}
function shimSenderReceiverGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender && window2.RTCRtpReceiver)) {
    return;
  }
  if (!("getStats" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        const senders = origGetSenders.apply(this, []);
        senders.forEach((sender) => sender._pc = this);
        return senders;
      };
    }
    const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
        const sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window2.RTCRtpSender.prototype.getStats = function getStats() {
      const sender = this;
      return this._pc.getStats().then((result) => (
        /* Note: this will include stats of all senders that
         *   send a track with the same id as sender.track as
         *   it is not possible to identify the RTCRtpSender.
         */
        filterStats(result, sender.track, true)
      ));
    };
  }
  if (!("getStats" in window2.RTCRtpReceiver.prototype)) {
    const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
        const receivers = origGetReceivers.apply(this, []);
        receivers.forEach((receiver) => receiver._pc = this);
        return receivers;
      };
    }
    wrapPeerConnectionEvent(window2, "track", (e) => {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window2.RTCRtpReceiver.prototype.getStats = function getStats() {
      const receiver = this;
      return this._pc.getStats().then((result) => filterStats(result, receiver.track, false));
    };
  }
  if (!("getStats" in window2.RTCRtpSender.prototype && "getStats" in window2.RTCRtpReceiver.prototype)) {
    return;
  }
  const origGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    if (arguments.length > 0 && arguments[0] instanceof window2.MediaStreamTrack) {
      const track = arguments[0];
      let sender;
      let receiver;
      let err;
      this.getSenders().forEach((s) => {
        if (s.track === track) {
          if (sender) {
            err = true;
          } else {
            sender = s;
          }
        }
      });
      this.getReceivers().forEach((r) => {
        if (r.track === track) {
          if (receiver) {
            err = true;
          } else {
            receiver = r;
          }
        }
        return r.track === track;
      });
      if (err || sender && receiver) {
        return Promise.reject(new DOMException("There are more than one sender or receiver for the track.", "InvalidAccessError"));
      } else if (sender) {
        return sender.getStats();
      } else if (receiver) {
        return receiver.getStats();
      }
      return Promise.reject(new DOMException("There is no sender or receiver for the track.", "InvalidAccessError"));
    }
    return origGetStats.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrackWithNative(window2) {
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    return Object.keys(this._shimmedLocalStreams).map((streamId) => this._shimmedLocalStreams[streamId][0]);
  };
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (!stream) {
      return origAddTrack.apply(this, arguments);
    }
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    const sender = origAddTrack.apply(this, arguments);
    if (!this._shimmedLocalStreams[stream.id]) {
      this._shimmedLocalStreams[stream.id] = [stream, sender];
    } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
      this._shimmedLocalStreams[stream.id].push(sender);
    }
    return sender;
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException("Track already exists.", "InvalidAccessError");
      }
    });
    const existingSenders = this.getSenders();
    origAddStream.apply(this, arguments);
    const newSenders = this.getSenders().filter((newSender) => existingSenders.indexOf(newSender) === -1);
    this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    delete this._shimmedLocalStreams[stream.id];
    return origRemoveStream.apply(this, arguments);
  };
  const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    if (sender) {
      Object.keys(this._shimmedLocalStreams).forEach((streamId) => {
        const idx = this._shimmedLocalStreams[streamId].indexOf(sender);
        if (idx !== -1) {
          this._shimmedLocalStreams[streamId].splice(idx, 1);
        }
        if (this._shimmedLocalStreams[streamId].length === 1) {
          delete this._shimmedLocalStreams[streamId];
        }
      });
    }
    return origRemoveTrack.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrack(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (window2.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
    return shimAddTrackRemoveTrackWithNative(window2);
  }
  const origGetLocalStreams = window2.RTCPeerConnection.prototype.getLocalStreams;
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    const nativeStreams = origGetLocalStreams.apply(this);
    this._reverseStreams = this._reverseStreams || {};
    return nativeStreams.map((stream) => this._reverseStreams[stream.id]);
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException("Track already exists.", "InvalidAccessError");
      }
    });
    if (!this._reverseStreams[stream.id]) {
      const newStream = new window2.MediaStream(stream.getTracks());
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      stream = newStream;
    }
    origAddStream.apply(this, [stream]);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
    delete this._reverseStreams[this._streams[stream.id] ? this._streams[stream.id].id : stream.id];
    delete this._streams[stream.id];
  };
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (this.signalingState === "closed") {
      throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
    }
    const streams = [].slice.call(arguments, 1);
    if (streams.length !== 1 || !streams[0].getTracks().find((t) => t === track)) {
      throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.", "NotSupportedError");
    }
    const alreadyExists = this.getSenders().find((s) => s.track === track);
    if (alreadyExists) {
      throw new DOMException("Track already exists.", "InvalidAccessError");
    }
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    const oldStream = this._streams[stream.id];
    if (oldStream) {
      oldStream.addTrack(track);
      Promise.resolve().then(() => {
        this.dispatchEvent(new Event("negotiationneeded"));
      });
    } else {
      const newStream = new window2.MediaStream([track]);
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      this.addStream(newStream);
    }
    return this.getSenders().find((s) => s.track === track);
  };
  function replaceInternalStreamId(pc, description) {
    let sdp2 = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp2 = sdp2.replace(new RegExp(internalStream.id, "g"), externalStream.id);
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp: sdp2
    });
  }
  function replaceExternalStreamId(pc, description) {
    let sdp2 = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp2 = sdp2.replace(new RegExp(externalStream.id, "g"), internalStream.id);
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp: sdp2
    });
  }
  ["createOffer", "createAnswer"].forEach(function(method) {
    const nativeMethod = window2.RTCPeerConnection.prototype[method];
    const methodObj = {
      [method]() {
        const args = arguments;
        const isLegacyCall = arguments.length && typeof arguments[0] === "function";
        if (isLegacyCall) {
          return nativeMethod.apply(this, [(description) => {
            const desc = replaceInternalStreamId(this, description);
            args[0].apply(null, [desc]);
          }, (err) => {
            if (args[1]) {
              args[1].apply(null, err);
            }
          }, arguments[2]]);
        }
        return nativeMethod.apply(this, arguments).then((description) => replaceInternalStreamId(this, description));
      }
    };
    window2.RTCPeerConnection.prototype[method] = methodObj[method];
  });
  const origSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    if (!arguments.length || !arguments[0].type) {
      return origSetLocalDescription.apply(this, arguments);
    }
    arguments[0] = replaceExternalStreamId(this, arguments[0]);
    return origSetLocalDescription.apply(this, arguments);
  };
  const origLocalDescription = Object.getOwnPropertyDescriptor(window2.RTCPeerConnection.prototype, "localDescription");
  Object.defineProperty(window2.RTCPeerConnection.prototype, "localDescription", {
    get() {
      const description = origLocalDescription.get.apply(this);
      if (description.type === "") {
        return description;
      }
      return replaceInternalStreamId(this, description);
    }
  });
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    if (this.signalingState === "closed") {
      throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
    }
    if (!sender._pc) {
      throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
    }
    const isLocal = sender._pc === this;
    if (!isLocal) {
      throw new DOMException("Sender was not created by this connection.", "InvalidAccessError");
    }
    this._streams = this._streams || {};
    let stream;
    Object.keys(this._streams).forEach((streamid) => {
      const hasTrack = this._streams[streamid].getTracks().find((track) => sender.track === track);
      if (hasTrack) {
        stream = this._streams[streamid];
      }
    });
    if (stream) {
      if (stream.getTracks().length === 1) {
        this.removeStream(this._reverseStreams[stream.id]);
      } else {
        stream.removeTrack(sender.track);
      }
      this.dispatchEvent(new Event("negotiationneeded"));
    }
  };
}
function shimPeerConnection(window2, browserDetails) {
  if (!window2.RTCPeerConnection && window2.webkitRTCPeerConnection) {
    window2.RTCPeerConnection = window2.webkitRTCPeerConnection;
  }
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = {
        [method]() {
          arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
          return nativeMethod.apply(this, arguments);
        }
      };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
}
function fixNegotiationNeeded(window2, browserDetails) {
  wrapPeerConnectionEvent(window2, "negotiationneeded", (e) => {
    const pc = e.target;
    if (browserDetails.version < 72 || pc.getConfiguration && pc.getConfiguration().sdpSemantics === "plan-b") {
      if (pc.signalingState !== "stable") {
        return;
      }
    }
    return e;
  });
}

// node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
var firefox_shim_exports = {};
__export(firefox_shim_exports, {
  shimAddTransceiver: () => shimAddTransceiver,
  shimCreateAnswer: () => shimCreateAnswer,
  shimCreateOffer: () => shimCreateOffer,
  shimGetDisplayMedia: () => shimGetDisplayMedia2,
  shimGetParameters: () => shimGetParameters,
  shimGetUserMedia: () => shimGetUserMedia2,
  shimOnTrack: () => shimOnTrack2,
  shimPeerConnection: () => shimPeerConnection2,
  shimRTCDataChannel: () => shimRTCDataChannel,
  shimReceiverGetStats: () => shimReceiverGetStats,
  shimRemoveStream: () => shimRemoveStream,
  shimSenderGetStats: () => shimSenderGetStats
});

// node_modules/webrtc-adapter/src/js/firefox/getusermedia.js
function shimGetUserMedia2(window2, browserDetails) {
  const navigator2 = window2 && window2.navigator;
  const MediaStreamTrack = window2 && window2.MediaStreamTrack;
  navigator2.getUserMedia = function(constraints, onSuccess, onError) {
    deprecated("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia");
    navigator2.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
  if (!(browserDetails.version > 55 && "autoGainControl" in navigator2.mediaDevices.getSupportedConstraints())) {
    const remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };
    const nativeGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(c) {
      if (typeof c === "object" && typeof c.audio === "object") {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, "autoGainControl", "mozAutoGainControl");
        remap(c.audio, "noiseSuppression", "mozNoiseSuppression");
      }
      return nativeGetUserMedia(c);
    };
    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        const obj = nativeGetSettings.apply(this, arguments);
        remap(obj, "mozAutoGainControl", "autoGainControl");
        remap(obj, "mozNoiseSuppression", "noiseSuppression");
        return obj;
      };
    }
    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      const nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === "audio" && typeof c === "object") {
          c = JSON.parse(JSON.stringify(c));
          remap(c, "autoGainControl", "mozAutoGainControl");
          remap(c, "noiseSuppression", "mozNoiseSuppression");
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
}

// node_modules/webrtc-adapter/src/js/firefox/getdisplaymedia.js
function shimGetDisplayMedia2(window2, preferredMediaSource) {
  if (window2.navigator.mediaDevices && "getDisplayMedia" in window2.navigator.mediaDevices) {
    return;
  }
  if (!window2.navigator.mediaDevices) {
    return;
  }
  window2.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
    if (!(constraints && constraints.video)) {
      const err = new DOMException("getDisplayMedia without video constraints is undefined");
      err.name = "NotFoundError";
      err.code = 8;
      return Promise.reject(err);
    }
    if (constraints.video === true) {
      constraints.video = {
        mediaSource: preferredMediaSource
      };
    } else {
      constraints.video.mediaSource = preferredMediaSource;
    }
    return window2.navigator.mediaDevices.getUserMedia(constraints);
  };
}

// node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
function shimOnTrack2(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return {
          receiver: this.receiver
        };
      }
    });
  }
}
function shimPeerConnection2(window2, browserDetails) {
  if (typeof window2 !== "object" || !(window2.RTCPeerConnection || window2.mozRTCPeerConnection)) {
    return;
  }
  if (!window2.RTCPeerConnection && window2.mozRTCPeerConnection) {
    window2.RTCPeerConnection = window2.mozRTCPeerConnection;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = {
        [method]() {
          arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
          return nativeMethod.apply(this, arguments);
        }
      };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
  const modernStatsTypes = {
    inboundrtp: "inbound-rtp",
    outboundrtp: "outbound-rtp",
    candidatepair: "candidate-pair",
    localcandidate: "local-candidate",
    remotecandidate: "remote-candidate"
  };
  const nativeGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;
    return nativeGetStats.apply(this, [selector || null]).then((stats) => {
      if (browserDetails.version < 53 && !onSucc) {
        try {
          stats.forEach((stat) => {
            stat.type = modernStatsTypes[stat.type] || stat.type;
          });
        } catch (e) {
          if (e.name !== "TypeError") {
            throw e;
          }
          stats.forEach((stat, i) => {
            stats.set(i, Object.assign({}, stat, {
              type: modernStatsTypes[stat.type] || stat.type
            }));
          });
        }
      }
      return stats;
    }).then(onSucc, onErr);
  };
}
function shimSenderGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && "getStats" in window2.RTCRtpSender.prototype) {
    return;
  }
  const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
  if (origGetSenders) {
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
  }
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  if (origAddTrack) {
    window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
      const sender = origAddTrack.apply(this, arguments);
      sender._pc = this;
      return sender;
    };
  }
  window2.RTCRtpSender.prototype.getStats = function getStats() {
    return this.track ? this._pc.getStats(this.track) : Promise.resolve(/* @__PURE__ */ new Map());
  };
}
function shimReceiverGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && "getStats" in window2.RTCRtpReceiver.prototype) {
    return;
  }
  const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
  if (origGetReceivers) {
    window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
      const receivers = origGetReceivers.apply(this, []);
      receivers.forEach((receiver) => receiver._pc = this);
      return receivers;
    };
  }
  wrapPeerConnectionEvent(window2, "track", (e) => {
    e.receiver._pc = e.srcElement;
    return e;
  });
  window2.RTCRtpReceiver.prototype.getStats = function getStats() {
    return this._pc.getStats(this.track);
  };
}
function shimRemoveStream(window2) {
  if (!window2.RTCPeerConnection || "removeStream" in window2.RTCPeerConnection.prototype) {
    return;
  }
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    deprecated("removeStream", "removeTrack");
    this.getSenders().forEach((sender) => {
      if (sender.track && stream.getTracks().includes(sender.track)) {
        this.removeTrack(sender);
      }
    });
  };
}
function shimRTCDataChannel(window2) {
  if (window2.DataChannel && !window2.RTCDataChannel) {
    window2.RTCDataChannel = window2.DataChannel;
  }
}
function shimAddTransceiver(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origAddTransceiver = window2.RTCPeerConnection.prototype.addTransceiver;
  if (origAddTransceiver) {
    window2.RTCPeerConnection.prototype.addTransceiver = function addTransceiver() {
      this.setParametersPromises = [];
      let sendEncodings = arguments[1] && arguments[1].sendEncodings;
      if (sendEncodings === void 0) {
        sendEncodings = [];
      }
      sendEncodings = [...sendEncodings];
      const shouldPerformCheck = sendEncodings.length > 0;
      if (shouldPerformCheck) {
        sendEncodings.forEach((encodingParam) => {
          if ("rid" in encodingParam) {
            const ridRegex = /^[a-z0-9]{0,16}$/i;
            if (!ridRegex.test(encodingParam.rid)) {
              throw new TypeError("Invalid RID value provided.");
            }
          }
          if ("scaleResolutionDownBy" in encodingParam) {
            if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1)) {
              throw new RangeError("scale_resolution_down_by must be >= 1.0");
            }
          }
          if ("maxFramerate" in encodingParam) {
            if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
              throw new RangeError("max_framerate must be >= 0.0");
            }
          }
        });
      }
      const transceiver = origAddTransceiver.apply(this, arguments);
      if (shouldPerformCheck) {
        const {
          sender
        } = transceiver;
        const params = sender.getParameters();
        if (!("encodings" in params) || // Avoid being fooled by patched getParameters() below.
        params.encodings.length === 1 && Object.keys(params.encodings[0]).length === 0) {
          params.encodings = sendEncodings;
          sender.sendEncodings = sendEncodings;
          this.setParametersPromises.push(sender.setParameters(params).then(() => {
            delete sender.sendEncodings;
          }).catch(() => {
            delete sender.sendEncodings;
          }));
        }
      }
      return transceiver;
    };
  }
}
function shimGetParameters(window2) {
  if (!(typeof window2 === "object" && window2.RTCRtpSender)) {
    return;
  }
  const origGetParameters = window2.RTCRtpSender.prototype.getParameters;
  if (origGetParameters) {
    window2.RTCRtpSender.prototype.getParameters = function getParameters() {
      const params = origGetParameters.apply(this, arguments);
      if (!("encodings" in params)) {
        params.encodings = [].concat(this.sendEncodings || [{}]);
      }
      return params;
    };
  }
}
function shimCreateOffer(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateOffer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimCreateAnswer(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origCreateAnswer = window2.RTCPeerConnection.prototype.createAnswer;
  window2.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateAnswer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateAnswer.apply(this, arguments);
  };
}

// node_modules/webrtc-adapter/src/js/safari/safari_shim.js
var safari_shim_exports = {};
__export(safari_shim_exports, {
  shimAudioContext: () => shimAudioContext,
  shimCallbacksAPI: () => shimCallbacksAPI,
  shimConstraints: () => shimConstraints,
  shimCreateOfferLegacy: () => shimCreateOfferLegacy,
  shimGetUserMedia: () => shimGetUserMedia3,
  shimLocalStreamsAPI: () => shimLocalStreamsAPI,
  shimRTCIceServerUrls: () => shimRTCIceServerUrls,
  shimRemoteStreamsAPI: () => shimRemoteStreamsAPI,
  shimTrackEventTransceiver: () => shimTrackEventTransceiver
});
function shimLocalStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getLocalStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      return this._localStreams;
    };
  }
  if (!("addStream" in window2.RTCPeerConnection.prototype)) {
    const _addTrack = window2.RTCPeerConnection.prototype.addTrack;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      if (!this._localStreams.includes(stream)) {
        this._localStreams.push(stream);
      }
      stream.getAudioTracks().forEach((track) => _addTrack.call(this, track, stream));
      stream.getVideoTracks().forEach((track) => _addTrack.call(this, track, stream));
    };
    window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, ...streams) {
      if (streams) {
        streams.forEach((stream) => {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (!this._localStreams.includes(stream)) {
            this._localStreams.push(stream);
          }
        });
      }
      return _addTrack.apply(this, arguments);
    };
  }
  if (!("removeStream" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      const index = this._localStreams.indexOf(stream);
      if (index === -1) {
        return;
      }
      this._localStreams.splice(index, 1);
      const tracks = stream.getTracks();
      this.getSenders().forEach((sender) => {
        if (tracks.includes(sender.track)) {
          this.removeTrack(sender);
        }
      });
    };
  }
}
function shimRemoteStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getRemoteStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getRemoteStreams = function getRemoteStreams() {
      return this._remoteStreams ? this._remoteStreams : [];
    };
  }
  if (!("onaddstream" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "onaddstream", {
      get() {
        return this._onaddstream;
      },
      set(f) {
        if (this._onaddstream) {
          this.removeEventListener("addstream", this._onaddstream);
          this.removeEventListener("track", this._onaddstreampoly);
        }
        this.addEventListener("addstream", this._onaddstream = f);
        this.addEventListener("track", this._onaddstreampoly = (e) => {
          e.streams.forEach((stream) => {
            if (!this._remoteStreams) {
              this._remoteStreams = [];
            }
            if (this._remoteStreams.includes(stream)) {
              return;
            }
            this._remoteStreams.push(stream);
            const event = new Event("addstream");
            event.stream = stream;
            this.dispatchEvent(event);
          });
        });
      }
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      const pc = this;
      if (!this._onaddstreampoly) {
        this.addEventListener("track", this._onaddstreampoly = function(e) {
          e.streams.forEach((stream) => {
            if (!pc._remoteStreams) {
              pc._remoteStreams = [];
            }
            if (pc._remoteStreams.indexOf(stream) >= 0) {
              return;
            }
            pc._remoteStreams.push(stream);
            const event = new Event("addstream");
            event.stream = stream;
            pc.dispatchEvent(event);
          });
        });
      }
      return origSetRemoteDescription.apply(pc, arguments);
    };
  }
}
function shimCallbacksAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  const prototype = window2.RTCPeerConnection.prototype;
  const origCreateOffer = prototype.createOffer;
  const origCreateAnswer = prototype.createAnswer;
  const setLocalDescription = prototype.setLocalDescription;
  const setRemoteDescription = prototype.setRemoteDescription;
  const addIceCandidate = prototype.addIceCandidate;
  prototype.createOffer = function createOffer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateOffer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.createAnswer = function createAnswer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateAnswer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  let withCallback = function(description, successCallback, failureCallback) {
    const promise = setLocalDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setLocalDescription = withCallback;
  withCallback = function(description, successCallback, failureCallback) {
    const promise = setRemoteDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setRemoteDescription = withCallback;
  withCallback = function(candidate, successCallback, failureCallback) {
    const promise = addIceCandidate.apply(this, [candidate]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.addIceCandidate = withCallback;
}
function shimGetUserMedia3(window2) {
  const navigator2 = window2 && window2.navigator;
  if (navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    const mediaDevices = navigator2.mediaDevices;
    const _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    navigator2.mediaDevices.getUserMedia = (constraints) => {
      return _getUserMedia(shimConstraints(constraints));
    };
  }
  if (!navigator2.getUserMedia && navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    navigator2.getUserMedia = function getUserMedia(constraints, cb, errcb) {
      navigator2.mediaDevices.getUserMedia(constraints).then(cb, errcb);
    }.bind(navigator2);
  }
}
function shimConstraints(constraints) {
  if (constraints && constraints.video !== void 0) {
    return Object.assign({}, constraints, {
      video: compactObject(constraints.video)
    });
  }
  return constraints;
}
function shimRTCIceServerUrls(window2) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const OrigPeerConnection = window2.RTCPeerConnection;
  window2.RTCPeerConnection = function RTCPeerConnection2(pcConfig, pcConstraints) {
    if (pcConfig && pcConfig.iceServers) {
      const newIceServers = [];
      for (let i = 0; i < pcConfig.iceServers.length; i++) {
        let server = pcConfig.iceServers[i];
        if (server.urls === void 0 && server.url) {
          deprecated("RTCIceServer.url", "RTCIceServer.urls");
          server = JSON.parse(JSON.stringify(server));
          server.urls = server.url;
          delete server.url;
          newIceServers.push(server);
        } else {
          newIceServers.push(pcConfig.iceServers[i]);
        }
      }
      pcConfig.iceServers = newIceServers;
    }
    return new OrigPeerConnection(pcConfig, pcConstraints);
  };
  window2.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
  if ("generateCertificate" in OrigPeerConnection) {
    Object.defineProperty(window2.RTCPeerConnection, "generateCertificate", {
      get() {
        return OrigPeerConnection.generateCertificate;
      }
    });
  }
}
function shimTrackEventTransceiver(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return {
          receiver: this.receiver
        };
      }
    });
  }
}
function shimCreateOfferLegacy(window2) {
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer(offerOptions) {
    if (offerOptions) {
      if (typeof offerOptions.offerToReceiveAudio !== "undefined") {
        offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
      }
      const audioTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "audio");
      if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
        if (audioTransceiver.direction === "sendrecv") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("sendonly");
          } else {
            audioTransceiver.direction = "sendonly";
          }
        } else if (audioTransceiver.direction === "recvonly") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("inactive");
          } else {
            audioTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
        this.addTransceiver("audio", {
          direction: "recvonly"
        });
      }
      if (typeof offerOptions.offerToReceiveVideo !== "undefined") {
        offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
      }
      const videoTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "video");
      if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
        if (videoTransceiver.direction === "sendrecv") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("sendonly");
          } else {
            videoTransceiver.direction = "sendonly";
          }
        } else if (videoTransceiver.direction === "recvonly") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("inactive");
          } else {
            videoTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
        this.addTransceiver("video", {
          direction: "recvonly"
        });
      }
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimAudioContext(window2) {
  if (typeof window2 !== "object" || window2.AudioContext) {
    return;
  }
  window2.AudioContext = window2.webkitAudioContext;
}

// node_modules/webrtc-adapter/src/js/common_shim.js
var common_shim_exports = {};
__export(common_shim_exports, {
  removeExtmapAllowMixed: () => removeExtmapAllowMixed,
  shimAddIceCandidateNullOrEmpty: () => shimAddIceCandidateNullOrEmpty,
  shimConnectionState: () => shimConnectionState,
  shimMaxMessageSize: () => shimMaxMessageSize,
  shimParameterlessSetLocalDescription: () => shimParameterlessSetLocalDescription,
  shimRTCIceCandidate: () => shimRTCIceCandidate,
  shimRTCIceCandidateRelayProtocol: () => shimRTCIceCandidateRelayProtocol,
  shimSendThrowTypeError: () => shimSendThrowTypeError
});
var import_sdp = __toESM(require_sdp());
function shimRTCIceCandidate(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "foundation" in window2.RTCIceCandidate.prototype) {
    return;
  }
  const NativeRTCIceCandidate = window2.RTCIceCandidate;
  window2.RTCIceCandidate = function RTCIceCandidate(args) {
    if (typeof args === "object" && args.candidate && args.candidate.indexOf("a=") === 0) {
      args = JSON.parse(JSON.stringify(args));
      args.candidate = args.candidate.substring(2);
    }
    if (args.candidate && args.candidate.length) {
      const nativeCandidate = new NativeRTCIceCandidate(args);
      const parsedCandidate = import_sdp.default.parseCandidate(args.candidate);
      for (const key in parsedCandidate) {
        if (!(key in nativeCandidate)) {
          Object.defineProperty(nativeCandidate, key, {
            value: parsedCandidate[key]
          });
        }
      }
      nativeCandidate.toJSON = function toJSON() {
        return {
          candidate: nativeCandidate.candidate,
          sdpMid: nativeCandidate.sdpMid,
          sdpMLineIndex: nativeCandidate.sdpMLineIndex,
          usernameFragment: nativeCandidate.usernameFragment
        };
      };
      return nativeCandidate;
    }
    return new NativeRTCIceCandidate(args);
  };
  window2.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;
  wrapPeerConnectionEvent(window2, "icecandidate", (e) => {
    if (e.candidate) {
      Object.defineProperty(e, "candidate", {
        value: new window2.RTCIceCandidate(e.candidate),
        writable: "false"
      });
    }
    return e;
  });
}
function shimRTCIceCandidateRelayProtocol(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "relayProtocol" in window2.RTCIceCandidate.prototype) {
    return;
  }
  wrapPeerConnectionEvent(window2, "icecandidate", (e) => {
    if (e.candidate) {
      const parsedCandidate = import_sdp.default.parseCandidate(e.candidate.candidate);
      if (parsedCandidate.type === "relay") {
        e.candidate.relayProtocol = {
          0: "tls",
          1: "tcp",
          2: "udp"
        }[parsedCandidate.priority >> 24];
      }
    }
    return e;
  });
}
function shimMaxMessageSize(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (!("sctp" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "sctp", {
      get() {
        return typeof this._sctp === "undefined" ? null : this._sctp;
      }
    });
  }
  const sctpInDescription = function(description) {
    if (!description || !description.sdp) {
      return false;
    }
    const sections = import_sdp.default.splitSections(description.sdp);
    sections.shift();
    return sections.some((mediaSection) => {
      const mLine = import_sdp.default.parseMLine(mediaSection);
      return mLine && mLine.kind === "application" && mLine.protocol.indexOf("SCTP") !== -1;
    });
  };
  const getRemoteFirefoxVersion = function(description) {
    const match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
    if (match === null || match.length < 2) {
      return -1;
    }
    const version2 = parseInt(match[1], 10);
    return version2 !== version2 ? -1 : version2;
  };
  const getCanSendMaxMessageSize = function(remoteIsFirefox) {
    let canSendMaxMessageSize = 65536;
    if (browserDetails.browser === "firefox") {
      if (browserDetails.version < 57) {
        if (remoteIsFirefox === -1) {
          canSendMaxMessageSize = 16384;
        } else {
          canSendMaxMessageSize = 2147483637;
        }
      } else if (browserDetails.version < 60) {
        canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
      } else {
        canSendMaxMessageSize = 2147483637;
      }
    }
    return canSendMaxMessageSize;
  };
  const getMaxMessageSize = function(description, remoteIsFirefox) {
    let maxMessageSize = 65536;
    if (browserDetails.browser === "firefox" && browserDetails.version === 57) {
      maxMessageSize = 65535;
    }
    const match = import_sdp.default.matchPrefix(description.sdp, "a=max-message-size:");
    if (match.length > 0) {
      maxMessageSize = parseInt(match[0].substring(19), 10);
    } else if (browserDetails.browser === "firefox" && remoteIsFirefox !== -1) {
      maxMessageSize = 2147483637;
    }
    return maxMessageSize;
  };
  const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
    this._sctp = null;
    if (browserDetails.browser === "chrome" && browserDetails.version >= 76) {
      const {
        sdpSemantics
      } = this.getConfiguration();
      if (sdpSemantics === "plan-b") {
        Object.defineProperty(this, "sctp", {
          get() {
            return typeof this._sctp === "undefined" ? null : this._sctp;
          },
          enumerable: true,
          configurable: true
        });
      }
    }
    if (sctpInDescription(arguments[0])) {
      const isFirefox2 = getRemoteFirefoxVersion(arguments[0]);
      const canSendMMS = getCanSendMaxMessageSize(isFirefox2);
      const remoteMMS = getMaxMessageSize(arguments[0], isFirefox2);
      let maxMessageSize;
      if (canSendMMS === 0 && remoteMMS === 0) {
        maxMessageSize = Number.POSITIVE_INFINITY;
      } else if (canSendMMS === 0 || remoteMMS === 0) {
        maxMessageSize = Math.max(canSendMMS, remoteMMS);
      } else {
        maxMessageSize = Math.min(canSendMMS, remoteMMS);
      }
      const sctp = {};
      Object.defineProperty(sctp, "maxMessageSize", {
        get() {
          return maxMessageSize;
        }
      });
      this._sctp = sctp;
    }
    return origSetRemoteDescription.apply(this, arguments);
  };
}
function shimSendThrowTypeError(window2) {
  if (!(window2.RTCPeerConnection && "createDataChannel" in window2.RTCPeerConnection.prototype)) {
    return;
  }
  function wrapDcSend(dc, pc) {
    const origDataChannelSend = dc.send;
    dc.send = function send() {
      const data = arguments[0];
      const length = data.length || data.size || data.byteLength;
      if (dc.readyState === "open" && pc.sctp && length > pc.sctp.maxMessageSize) {
        throw new TypeError("Message too large (can send a maximum of " + pc.sctp.maxMessageSize + " bytes)");
      }
      return origDataChannelSend.apply(dc, arguments);
    };
  }
  const origCreateDataChannel = window2.RTCPeerConnection.prototype.createDataChannel;
  window2.RTCPeerConnection.prototype.createDataChannel = function createDataChannel() {
    const dataChannel = origCreateDataChannel.apply(this, arguments);
    wrapDcSend(dataChannel, this);
    return dataChannel;
  };
  wrapPeerConnectionEvent(window2, "datachannel", (e) => {
    wrapDcSend(e.channel, e.target);
    return e;
  });
}
function shimConnectionState(window2) {
  if (!window2.RTCPeerConnection || "connectionState" in window2.RTCPeerConnection.prototype) {
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  Object.defineProperty(proto, "connectionState", {
    get() {
      return {
        completed: "connected",
        checking: "connecting"
      }[this.iceConnectionState] || this.iceConnectionState;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(proto, "onconnectionstatechange", {
    get() {
      return this._onconnectionstatechange || null;
    },
    set(cb) {
      if (this._onconnectionstatechange) {
        this.removeEventListener("connectionstatechange", this._onconnectionstatechange);
        delete this._onconnectionstatechange;
      }
      if (cb) {
        this.addEventListener("connectionstatechange", this._onconnectionstatechange = cb);
      }
    },
    enumerable: true,
    configurable: true
  });
  ["setLocalDescription", "setRemoteDescription"].forEach((method) => {
    const origMethod = proto[method];
    proto[method] = function() {
      if (!this._connectionstatechangepoly) {
        this._connectionstatechangepoly = (e) => {
          const pc = e.target;
          if (pc._lastConnectionState !== pc.connectionState) {
            pc._lastConnectionState = pc.connectionState;
            const newEvent = new Event("connectionstatechange", e);
            pc.dispatchEvent(newEvent);
          }
          return e;
        };
        this.addEventListener("iceconnectionstatechange", this._connectionstatechangepoly);
      }
      return origMethod.apply(this, arguments);
    };
  });
}
function removeExtmapAllowMixed(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.browser === "chrome" && browserDetails.version >= 71) {
    return;
  }
  if (browserDetails.browser === "safari" && browserDetails.version >= 605) {
    return;
  }
  const nativeSRD = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
    if (desc && desc.sdp && desc.sdp.indexOf("\na=extmap-allow-mixed") !== -1) {
      const sdp2 = desc.sdp.split("\n").filter((line) => {
        return line.trim() !== "a=extmap-allow-mixed";
      }).join("\n");
      if (window2.RTCSessionDescription && desc instanceof window2.RTCSessionDescription) {
        arguments[0] = new window2.RTCSessionDescription({
          type: desc.type,
          sdp: sdp2
        });
      } else {
        desc.sdp = sdp2;
      }
    }
    return nativeSRD.apply(this, arguments);
  };
}
function shimAddIceCandidateNullOrEmpty(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeAddIceCandidate = window2.RTCPeerConnection.prototype.addIceCandidate;
  if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
    if (!arguments[0]) {
      if (arguments[1]) {
        arguments[1].apply(null);
      }
      return Promise.resolve();
    }
    if ((browserDetails.browser === "chrome" && browserDetails.version < 78 || browserDetails.browser === "firefox" && browserDetails.version < 68 || browserDetails.browser === "safari") && arguments[0] && arguments[0].candidate === "") {
      return Promise.resolve();
    }
    return nativeAddIceCandidate.apply(this, arguments);
  };
}
function shimParameterlessSetLocalDescription(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    let desc = arguments[0] || {};
    if (typeof desc !== "object" || desc.type && desc.sdp) {
      return nativeSetLocalDescription.apply(this, arguments);
    }
    desc = {
      type: desc.type,
      sdp: desc.sdp
    };
    if (!desc.type) {
      switch (this.signalingState) {
        case "stable":
        case "have-local-offer":
        case "have-remote-pranswer":
          desc.type = "offer";
          break;
        default:
          desc.type = "answer";
          break;
      }
    }
    if (desc.sdp || desc.type !== "offer" && desc.type !== "answer") {
      return nativeSetLocalDescription.apply(this, [desc]);
    }
    const func = desc.type === "offer" ? this.createOffer : this.createAnswer;
    return func.apply(this).then((d) => nativeSetLocalDescription.apply(this, [d]));
  };
}

// node_modules/webrtc-adapter/src/js/adapter_factory.js
var sdp = __toESM(require_sdp());
function adapterFactory({
  window: window2
} = {}, options = {
  shimChrome: true,
  shimFirefox: true,
  shimSafari: true
}) {
  const logging2 = log;
  const browserDetails = detectBrowser(window2);
  const adapter2 = {
    browserDetails,
    commonShim: common_shim_exports,
    extractVersion,
    disableLog,
    disableWarnings,
    // Expose sdp as a convenience. For production apps include directly.
    sdp
  };
  switch (browserDetails.browser) {
    case "chrome":
      if (!chrome_shim_exports || !shimPeerConnection || !options.shimChrome) {
        logging2("Chrome shim is not included in this adapter release.");
        return adapter2;
      }
      if (browserDetails.version === null) {
        logging2("Chrome shim can not determine version, not shimming.");
        return adapter2;
      }
      logging2("adapter.js shimming chrome.");
      adapter2.browserShim = chrome_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimGetUserMedia(window2, browserDetails);
      shimMediaStream(window2, browserDetails);
      shimPeerConnection(window2, browserDetails);
      shimOnTrack(window2, browserDetails);
      shimAddTrackRemoveTrack(window2, browserDetails);
      shimGetSendersWithDtmf(window2, browserDetails);
      shimGetStats(window2, browserDetails);
      shimSenderReceiverGetStats(window2, browserDetails);
      fixNegotiationNeeded(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimRTCIceCandidateRelayProtocol(window2, browserDetails);
      shimConnectionState(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    case "firefox":
      if (!firefox_shim_exports || !shimPeerConnection2 || !options.shimFirefox) {
        logging2("Firefox shim is not included in this adapter release.");
        return adapter2;
      }
      logging2("adapter.js shimming firefox.");
      adapter2.browserShim = firefox_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimGetUserMedia2(window2, browserDetails);
      shimPeerConnection2(window2, browserDetails);
      shimOnTrack2(window2, browserDetails);
      shimRemoveStream(window2, browserDetails);
      shimSenderGetStats(window2, browserDetails);
      shimReceiverGetStats(window2, browserDetails);
      shimRTCDataChannel(window2, browserDetails);
      shimAddTransceiver(window2, browserDetails);
      shimGetParameters(window2, browserDetails);
      shimCreateOffer(window2, browserDetails);
      shimCreateAnswer(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimConnectionState(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      break;
    case "safari":
      if (!safari_shim_exports || !options.shimSafari) {
        logging2("Safari shim is not included in this adapter release.");
        return adapter2;
      }
      logging2("adapter.js shimming safari.");
      adapter2.browserShim = safari_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimRTCIceServerUrls(window2, browserDetails);
      shimCreateOfferLegacy(window2, browserDetails);
      shimCallbacksAPI(window2, browserDetails);
      shimLocalStreamsAPI(window2, browserDetails);
      shimRemoteStreamsAPI(window2, browserDetails);
      shimTrackEventTransceiver(window2, browserDetails);
      shimGetUserMedia3(window2, browserDetails);
      shimAudioContext(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimRTCIceCandidateRelayProtocol(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    default:
      logging2("Unsupported browser!");
      break;
  }
  return adapter2;
}

// node_modules/webrtc-adapter/src/js/adapter_core.js
var adapter = adapterFactory({
  window: typeof window === "undefined" ? void 0 : window
});

// node_modules/@protobuf-ts/runtime/build/es2015/json-typings.js
function typeofJsonValue(value) {
  let t = typeof value;
  if (t == "object") {
    if (Array.isArray(value)) return "array";
    if (value === null) return "null";
  }
  return t;
}
function isJsonObject(value) {
  return value !== null && typeof value == "object" && !Array.isArray(value);
}

// node_modules/@protobuf-ts/runtime/build/es2015/base64.js
var encTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
var decTable = [];
for (let i = 0; i < encTable.length; i++) decTable[encTable[i].charCodeAt(0)] = i;
decTable["-".charCodeAt(0)] = encTable.indexOf("+");
decTable["_".charCodeAt(0)] = encTable.indexOf("/");
function base64decode(base64Str) {
  let es = base64Str.length * 3 / 4;
  if (base64Str[base64Str.length - 2] == "=") es -= 2;
  else if (base64Str[base64Str.length - 1] == "=") es -= 1;
  let bytes = new Uint8Array(es), bytePos = 0, groupPos = 0, b, p = 0;
  for (let i = 0; i < base64Str.length; i++) {
    b = decTable[base64Str.charCodeAt(i)];
    if (b === void 0) {
      switch (base64Str[i]) {
        case "=":
          groupPos = 0;
        case "\n":
        case "\r":
        case "	":
        case " ":
          continue;
        default:
          throw Error(`invalid base64 string.`);
      }
    }
    switch (groupPos) {
      case 0:
        p = b;
        groupPos = 1;
        break;
      case 1:
        bytes[bytePos++] = p << 2 | (b & 48) >> 4;
        p = b;
        groupPos = 2;
        break;
      case 2:
        bytes[bytePos++] = (p & 15) << 4 | (b & 60) >> 2;
        p = b;
        groupPos = 3;
        break;
      case 3:
        bytes[bytePos++] = (p & 3) << 6 | b;
        groupPos = 0;
        break;
    }
  }
  if (groupPos == 1) throw Error(`invalid base64 string.`);
  return bytes.subarray(0, bytePos);
}
function base64encode(bytes) {
  let base64 = "", groupPos = 0, b, p = 0;
  for (let i = 0; i < bytes.length; i++) {
    b = bytes[i];
    switch (groupPos) {
      case 0:
        base64 += encTable[b >> 2];
        p = (b & 3) << 4;
        groupPos = 1;
        break;
      case 1:
        base64 += encTable[p | b >> 4];
        p = (b & 15) << 2;
        groupPos = 2;
        break;
      case 2:
        base64 += encTable[p | b >> 6];
        base64 += encTable[b & 63];
        groupPos = 0;
        break;
    }
  }
  if (groupPos) {
    base64 += encTable[p];
    base64 += "=";
    if (groupPos == 1) base64 += "=";
  }
  return base64;
}

// node_modules/@protobuf-ts/runtime/build/es2015/binary-format-contract.js
var UnknownFieldHandler;
(function(UnknownFieldHandler2) {
  UnknownFieldHandler2.symbol = Symbol.for("protobuf-ts/unknown");
  UnknownFieldHandler2.onRead = (typeName, message, fieldNo, wireType, data) => {
    let container = is(message) ? message[UnknownFieldHandler2.symbol] : message[UnknownFieldHandler2.symbol] = [];
    container.push({
      no: fieldNo,
      wireType,
      data
    });
  };
  UnknownFieldHandler2.onWrite = (typeName, message, writer) => {
    for (let {
      no,
      wireType,
      data
    } of UnknownFieldHandler2.list(message)) writer.tag(no, wireType).raw(data);
  };
  UnknownFieldHandler2.list = (message, fieldNo) => {
    if (is(message)) {
      let all = message[UnknownFieldHandler2.symbol];
      return fieldNo ? all.filter((uf) => uf.no == fieldNo) : all;
    }
    return [];
  };
  UnknownFieldHandler2.last = (message, fieldNo) => UnknownFieldHandler2.list(message, fieldNo).slice(-1)[0];
  const is = (message) => message && Array.isArray(message[UnknownFieldHandler2.symbol]);
})(UnknownFieldHandler || (UnknownFieldHandler = {}));
function mergeBinaryOptions(a, b) {
  return Object.assign(Object.assign({}, a), b);
}
var WireType;
(function(WireType2) {
  WireType2[WireType2["Varint"] = 0] = "Varint";
  WireType2[WireType2["Bit64"] = 1] = "Bit64";
  WireType2[WireType2["LengthDelimited"] = 2] = "LengthDelimited";
  WireType2[WireType2["StartGroup"] = 3] = "StartGroup";
  WireType2[WireType2["EndGroup"] = 4] = "EndGroup";
  WireType2[WireType2["Bit32"] = 5] = "Bit32";
})(WireType || (WireType = {}));

// node_modules/@protobuf-ts/runtime/build/es2015/goog-varint.js
function varint64read() {
  let lowBits = 0;
  let highBits = 0;
  for (let shift = 0; shift < 28; shift += 7) {
    let b = this.buf[this.pos++];
    lowBits |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.assertBounds();
      return [lowBits, highBits];
    }
  }
  let middleByte = this.buf[this.pos++];
  lowBits |= (middleByte & 15) << 28;
  highBits = (middleByte & 112) >> 4;
  if ((middleByte & 128) == 0) {
    this.assertBounds();
    return [lowBits, highBits];
  }
  for (let shift = 3; shift <= 31; shift += 7) {
    let b = this.buf[this.pos++];
    highBits |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.assertBounds();
      return [lowBits, highBits];
    }
  }
  throw new Error("invalid varint");
}
function varint64write(lo, hi, bytes) {
  for (let i = 0; i < 28; i = i + 7) {
    const shift = lo >>> i;
    const hasNext = !(shift >>> 7 == 0 && hi == 0);
    const byte = (hasNext ? shift | 128 : shift) & 255;
    bytes.push(byte);
    if (!hasNext) {
      return;
    }
  }
  const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
  const hasMoreBits = !(hi >> 3 == 0);
  bytes.push((hasMoreBits ? splitBits | 128 : splitBits) & 255);
  if (!hasMoreBits) {
    return;
  }
  for (let i = 3; i < 31; i = i + 7) {
    const shift = hi >>> i;
    const hasNext = !(shift >>> 7 == 0);
    const byte = (hasNext ? shift | 128 : shift) & 255;
    bytes.push(byte);
    if (!hasNext) {
      return;
    }
  }
  bytes.push(hi >>> 31 & 1);
}
var TWO_PWR_32_DBL = (1 << 16) * (1 << 16);
function int64fromString(dec) {
  let minus = dec[0] == "-";
  if (minus) dec = dec.slice(1);
  const base = 1e6;
  let lowBits = 0;
  let highBits = 0;
  function add1e6digit(begin, end) {
    const digit1e6 = Number(dec.slice(begin, end));
    highBits *= base;
    lowBits = lowBits * base + digit1e6;
    if (lowBits >= TWO_PWR_32_DBL) {
      highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
      lowBits = lowBits % TWO_PWR_32_DBL;
    }
  }
  add1e6digit(-24, -18);
  add1e6digit(-18, -12);
  add1e6digit(-12, -6);
  add1e6digit(-6);
  return [minus, lowBits, highBits];
}
function int64toString(bitsLow, bitsHigh) {
  if (bitsHigh >>> 0 <= 2097151) {
    return "" + (TWO_PWR_32_DBL * bitsHigh + (bitsLow >>> 0));
  }
  let low = bitsLow & 16777215;
  let mid = (bitsLow >>> 24 | bitsHigh << 8) >>> 0 & 16777215;
  let high = bitsHigh >> 16 & 65535;
  let digitA = low + mid * 6777216 + high * 6710656;
  let digitB = mid + high * 8147497;
  let digitC = high * 2;
  let base = 1e7;
  if (digitA >= base) {
    digitB += Math.floor(digitA / base);
    digitA %= base;
  }
  if (digitB >= base) {
    digitC += Math.floor(digitB / base);
    digitB %= base;
  }
  function decimalFrom1e7(digit1e7, needLeadingZeros) {
    let partial = digit1e7 ? String(digit1e7) : "";
    if (needLeadingZeros) {
      return "0000000".slice(partial.length) + partial;
    }
    return partial;
  }
  return decimalFrom1e7(
    digitC,
    /*needLeadingZeros=*/
    0
  ) + decimalFrom1e7(
    digitB,
    /*needLeadingZeros=*/
    digitC
  ) + // If the final 1e7 digit didn't need leading zeros, we would have
  // returned via the trivial code path at the top.
  decimalFrom1e7(
    digitA,
    /*needLeadingZeros=*/
    1
  );
}
function varint32write(value, bytes) {
  if (value >= 0) {
    while (value > 127) {
      bytes.push(value & 127 | 128);
      value = value >>> 7;
    }
    bytes.push(value);
  } else {
    for (let i = 0; i < 9; i++) {
      bytes.push(value & 127 | 128);
      value = value >> 7;
    }
    bytes.push(1);
  }
}
function varint32read() {
  let b = this.buf[this.pos++];
  let result = b & 127;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 7;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 14;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 21;
  if ((b & 128) == 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 15) << 28;
  for (let readBytes = 5; (b & 128) !== 0 && readBytes < 10; readBytes++) b = this.buf[this.pos++];
  if ((b & 128) != 0) throw new Error("invalid varint");
  this.assertBounds();
  return result >>> 0;
}

// node_modules/@protobuf-ts/runtime/build/es2015/pb-long.js
var BI;
function detectBi() {
  const dv = new DataView(new ArrayBuffer(8));
  const ok = globalThis.BigInt !== void 0 && typeof dv.getBigInt64 === "function" && typeof dv.getBigUint64 === "function" && typeof dv.setBigInt64 === "function" && typeof dv.setBigUint64 === "function";
  BI = ok ? {
    MIN: BigInt("-9223372036854775808"),
    MAX: BigInt("9223372036854775807"),
    UMIN: BigInt("0"),
    UMAX: BigInt("18446744073709551615"),
    C: BigInt,
    V: dv
  } : void 0;
}
detectBi();
function assertBi(bi) {
  if (!bi) throw new Error("BigInt unavailable, see https://github.com/timostamm/protobuf-ts/blob/v1.0.8/MANUAL.md#bigint-support");
}
var RE_DECIMAL_STR = /^-?[0-9]+$/;
var TWO_PWR_32_DBL2 = 4294967296;
var HALF_2_PWR_32 = 2147483648;
var SharedPbLong = class {
  /**
   * Create a new instance with the given bits.
   */
  constructor(lo, hi) {
    this.lo = lo | 0;
    this.hi = hi | 0;
  }
  /**
   * Is this instance equal to 0?
   */
  isZero() {
    return this.lo == 0 && this.hi == 0;
  }
  /**
   * Convert to a native number.
   */
  toNumber() {
    let result = this.hi * TWO_PWR_32_DBL2 + (this.lo >>> 0);
    if (!Number.isSafeInteger(result)) throw new Error("cannot convert to safe number");
    return result;
  }
};
var PbULong = class _PbULong extends SharedPbLong {
  /**
   * Create instance from a `string`, `number` or `bigint`.
   */
  static from(value) {
    if (BI)
      switch (typeof value) {
        case "string":
          if (value == "0") return this.ZERO;
          if (value == "") throw new Error("string is no integer");
          value = BI.C(value);
        case "number":
          if (value === 0) return this.ZERO;
          value = BI.C(value);
        case "bigint":
          if (!value) return this.ZERO;
          if (value < BI.UMIN) throw new Error("signed value for ulong");
          if (value > BI.UMAX) throw new Error("ulong too large");
          BI.V.setBigUint64(0, value, true);
          return new _PbULong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
      }
    else switch (typeof value) {
      case "string":
        if (value == "0") return this.ZERO;
        value = value.trim();
        if (!RE_DECIMAL_STR.test(value)) throw new Error("string is no integer");
        let [minus, lo, hi] = int64fromString(value);
        if (minus) throw new Error("signed value for ulong");
        return new _PbULong(lo, hi);
      case "number":
        if (value == 0) return this.ZERO;
        if (!Number.isSafeInteger(value)) throw new Error("number is no integer");
        if (value < 0) throw new Error("signed value for ulong");
        return new _PbULong(value, value / TWO_PWR_32_DBL2);
    }
    throw new Error("unknown value " + typeof value);
  }
  /**
   * Convert to decimal string.
   */
  toString() {
    return BI ? this.toBigInt().toString() : int64toString(this.lo, this.hi);
  }
  /**
   * Convert to native bigint.
   */
  toBigInt() {
    assertBi(BI);
    BI.V.setInt32(0, this.lo, true);
    BI.V.setInt32(4, this.hi, true);
    return BI.V.getBigUint64(0, true);
  }
};
PbULong.ZERO = new PbULong(0, 0);
var PbLong = class _PbLong extends SharedPbLong {
  /**
   * Create instance from a `string`, `number` or `bigint`.
   */
  static from(value) {
    if (BI)
      switch (typeof value) {
        case "string":
          if (value == "0") return this.ZERO;
          if (value == "") throw new Error("string is no integer");
          value = BI.C(value);
        case "number":
          if (value === 0) return this.ZERO;
          value = BI.C(value);
        case "bigint":
          if (!value) return this.ZERO;
          if (value < BI.MIN) throw new Error("signed long too small");
          if (value > BI.MAX) throw new Error("signed long too large");
          BI.V.setBigInt64(0, value, true);
          return new _PbLong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
      }
    else switch (typeof value) {
      case "string":
        if (value == "0") return this.ZERO;
        value = value.trim();
        if (!RE_DECIMAL_STR.test(value)) throw new Error("string is no integer");
        let [minus, lo, hi] = int64fromString(value);
        if (minus) {
          if (hi > HALF_2_PWR_32 || hi == HALF_2_PWR_32 && lo != 0) throw new Error("signed long too small");
        } else if (hi >= HALF_2_PWR_32) throw new Error("signed long too large");
        let pbl = new _PbLong(lo, hi);
        return minus ? pbl.negate() : pbl;
      case "number":
        if (value == 0) return this.ZERO;
        if (!Number.isSafeInteger(value)) throw new Error("number is no integer");
        return value > 0 ? new _PbLong(value, value / TWO_PWR_32_DBL2) : new _PbLong(-value, -value / TWO_PWR_32_DBL2).negate();
    }
    throw new Error("unknown value " + typeof value);
  }
  /**
   * Do we have a minus sign?
   */
  isNegative() {
    return (this.hi & HALF_2_PWR_32) !== 0;
  }
  /**
   * Negate two's complement.
   * Invert all the bits and add one to the result.
   */
  negate() {
    let hi = ~this.hi, lo = this.lo;
    if (lo) lo = ~lo + 1;
    else hi += 1;
    return new _PbLong(lo, hi);
  }
  /**
   * Convert to decimal string.
   */
  toString() {
    if (BI) return this.toBigInt().toString();
    if (this.isNegative()) {
      let n = this.negate();
      return "-" + int64toString(n.lo, n.hi);
    }
    return int64toString(this.lo, this.hi);
  }
  /**
   * Convert to native bigint.
   */
  toBigInt() {
    assertBi(BI);
    BI.V.setInt32(0, this.lo, true);
    BI.V.setInt32(4, this.hi, true);
    return BI.V.getBigInt64(0, true);
  }
};
PbLong.ZERO = new PbLong(0, 0);

// node_modules/@protobuf-ts/runtime/build/es2015/binary-reader.js
var defaultsRead = {
  readUnknownField: true,
  readerFactory: (bytes) => new BinaryReader(bytes)
};
function binaryReadOptions(options) {
  return options ? Object.assign(Object.assign({}, defaultsRead), options) : defaultsRead;
}
var BinaryReader = class {
  constructor(buf, textDecoder) {
    this.varint64 = varint64read;
    this.uint32 = varint32read;
    this.buf = buf;
    this.len = buf.length;
    this.pos = 0;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    this.textDecoder = textDecoder !== null && textDecoder !== void 0 ? textDecoder : new TextDecoder("utf-8", {
      fatal: true,
      ignoreBOM: true
    });
  }
  /**
   * Reads a tag - field number and wire type.
   */
  tag() {
    let tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
    if (fieldNo <= 0 || wireType < 0 || wireType > 5) throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
    return [fieldNo, wireType];
  }
  /**
   * Skip one element on the wire and return the skipped data.
   * Supports WireType.StartGroup since v2.0.0-alpha.23.
   */
  skip(wireType) {
    let start = this.pos;
    switch (wireType) {
      case WireType.Varint:
        while (this.buf[this.pos++] & 128) {
        }
        break;
      case WireType.Bit64:
        this.pos += 4;
      case WireType.Bit32:
        this.pos += 4;
        break;
      case WireType.LengthDelimited:
        let len = this.uint32();
        this.pos += len;
        break;
      case WireType.StartGroup:
        let t;
        while ((t = this.tag()[1]) !== WireType.EndGroup) {
          this.skip(t);
        }
        break;
      default:
        throw new Error("cant skip wire type " + wireType);
    }
    this.assertBounds();
    return this.buf.subarray(start, this.pos);
  }
  /**
   * Throws error if position in byte array is out of range.
   */
  assertBounds() {
    if (this.pos > this.len) throw new RangeError("premature EOF");
  }
  /**
   * Read a `int32` field, a signed 32 bit varint.
   */
  int32() {
    return this.uint32() | 0;
  }
  /**
   * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
   */
  sint32() {
    let zze = this.uint32();
    return zze >>> 1 ^ -(zze & 1);
  }
  /**
   * Read a `int64` field, a signed 64-bit varint.
   */
  int64() {
    return new PbLong(...this.varint64());
  }
  /**
   * Read a `uint64` field, an unsigned 64-bit varint.
   */
  uint64() {
    return new PbULong(...this.varint64());
  }
  /**
   * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64() {
    let [lo, hi] = this.varint64();
    let s = -(lo & 1);
    lo = (lo >>> 1 | (hi & 1) << 31) ^ s;
    hi = hi >>> 1 ^ s;
    return new PbLong(lo, hi);
  }
  /**
   * Read a `bool` field, a variant.
   */
  bool() {
    let [lo, hi] = this.varint64();
    return lo !== 0 || hi !== 0;
  }
  /**
   * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
   */
  fixed32() {
    return this.view.getUint32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
   */
  sfixed32() {
    return this.view.getInt32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
   */
  fixed64() {
    return new PbULong(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
   */
  sfixed64() {
    return new PbLong(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `float` field, 32-bit floating point number.
   */
  float() {
    return this.view.getFloat32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `double` field, a 64-bit floating point number.
   */
  double() {
    return this.view.getFloat64((this.pos += 8) - 8, true);
  }
  /**
   * Read a `bytes` field, length-delimited arbitrary data.
   */
  bytes() {
    let len = this.uint32();
    let start = this.pos;
    this.pos += len;
    this.assertBounds();
    return this.buf.subarray(start, start + len);
  }
  /**
   * Read a `string` field, length-delimited data converted to UTF-8 text.
   */
  string() {
    return this.textDecoder.decode(this.bytes());
  }
};

// node_modules/@protobuf-ts/runtime/build/es2015/assert.js
function assert(condition, msg) {
  if (!condition) {
    throw new Error(msg);
  }
}
function assertNever(value, msg) {
  throw new Error(msg !== null && msg !== void 0 ? msg : "Unexpected object: " + value);
}
var FLOAT32_MAX = 34028234663852886e22;
var FLOAT32_MIN = -34028234663852886e22;
var UINT32_MAX = 4294967295;
var INT32_MAX = 2147483647;
var INT32_MIN = -2147483648;
function assertInt32(arg) {
  if (typeof arg !== "number") throw new Error("invalid int 32: " + typeof arg);
  if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN) throw new Error("invalid int 32: " + arg);
}
function assertUInt32(arg) {
  if (typeof arg !== "number") throw new Error("invalid uint 32: " + typeof arg);
  if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0) throw new Error("invalid uint 32: " + arg);
}
function assertFloat32(arg) {
  if (typeof arg !== "number") throw new Error("invalid float 32: " + typeof arg);
  if (!Number.isFinite(arg)) return;
  if (arg > FLOAT32_MAX || arg < FLOAT32_MIN) throw new Error("invalid float 32: " + arg);
}

// node_modules/@protobuf-ts/runtime/build/es2015/binary-writer.js
var defaultsWrite = {
  writeUnknownFields: true,
  writerFactory: () => new BinaryWriter()
};
function binaryWriteOptions(options) {
  return options ? Object.assign(Object.assign({}, defaultsWrite), options) : defaultsWrite;
}
var BinaryWriter = class {
  constructor(textEncoder) {
    this.stack = [];
    this.textEncoder = textEncoder !== null && textEncoder !== void 0 ? textEncoder : new TextEncoder();
    this.chunks = [];
    this.buf = [];
  }
  /**
   * Return all bytes written and reset this writer.
   */
  finish() {
    this.chunks.push(new Uint8Array(this.buf));
    let len = 0;
    for (let i = 0; i < this.chunks.length; i++) len += this.chunks[i].length;
    let bytes = new Uint8Array(len);
    let offset = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      bytes.set(this.chunks[i], offset);
      offset += this.chunks[i].length;
    }
    this.chunks = [];
    return bytes;
  }
  /**
   * Start a new fork for length-delimited data like a message
   * or a packed repeated field.
   *
   * Must be joined later with `join()`.
   */
  fork() {
    this.stack.push({
      chunks: this.chunks,
      buf: this.buf
    });
    this.chunks = [];
    this.buf = [];
    return this;
  }
  /**
   * Join the last fork. Write its length and bytes, then
   * return to the previous state.
   */
  join() {
    let chunk = this.finish();
    let prev = this.stack.pop();
    if (!prev) throw new Error("invalid state, fork stack empty");
    this.chunks = prev.chunks;
    this.buf = prev.buf;
    this.uint32(chunk.byteLength);
    return this.raw(chunk);
  }
  /**
   * Writes a tag (field number and wire type).
   *
   * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
   *
   * Generated code should compute the tag ahead of time and call `uint32()`.
   */
  tag(fieldNo, type) {
    return this.uint32((fieldNo << 3 | type) >>> 0);
  }
  /**
   * Write a chunk of raw bytes.
   */
  raw(chunk) {
    if (this.buf.length) {
      this.chunks.push(new Uint8Array(this.buf));
      this.buf = [];
    }
    this.chunks.push(chunk);
    return this;
  }
  /**
   * Write a `uint32` value, an unsigned 32 bit varint.
   */
  uint32(value) {
    assertUInt32(value);
    while (value > 127) {
      this.buf.push(value & 127 | 128);
      value = value >>> 7;
    }
    this.buf.push(value);
    return this;
  }
  /**
   * Write a `int32` value, a signed 32 bit varint.
   */
  int32(value) {
    assertInt32(value);
    varint32write(value, this.buf);
    return this;
  }
  /**
   * Write a `bool` value, a variant.
   */
  bool(value) {
    this.buf.push(value ? 1 : 0);
    return this;
  }
  /**
   * Write a `bytes` value, length-delimited arbitrary data.
   */
  bytes(value) {
    this.uint32(value.byteLength);
    return this.raw(value);
  }
  /**
   * Write a `string` value, length-delimited data converted to UTF-8 text.
   */
  string(value) {
    let chunk = this.textEncoder.encode(value);
    this.uint32(chunk.byteLength);
    return this.raw(chunk);
  }
  /**
   * Write a `float` value, 32-bit floating point number.
   */
  float(value) {
    assertFloat32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setFloat32(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `double` value, a 64-bit floating point number.
   */
  double(value) {
    let chunk = new Uint8Array(8);
    new DataView(chunk.buffer).setFloat64(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
   */
  fixed32(value) {
    assertUInt32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setUint32(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
   */
  sfixed32(value) {
    assertInt32(value);
    let chunk = new Uint8Array(4);
    new DataView(chunk.buffer).setInt32(0, value, true);
    return this.raw(chunk);
  }
  /**
   * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
   */
  sint32(value) {
    assertInt32(value);
    value = (value << 1 ^ value >> 31) >>> 0;
    varint32write(value, this.buf);
    return this;
  }
  /**
   * Write a `fixed64` value, a signed, fixed-length 64-bit integer.
   */
  sfixed64(value) {
    let chunk = new Uint8Array(8);
    let view = new DataView(chunk.buffer);
    let long = PbLong.from(value);
    view.setInt32(0, long.lo, true);
    view.setInt32(4, long.hi, true);
    return this.raw(chunk);
  }
  /**
   * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
   */
  fixed64(value) {
    let chunk = new Uint8Array(8);
    let view = new DataView(chunk.buffer);
    let long = PbULong.from(value);
    view.setInt32(0, long.lo, true);
    view.setInt32(4, long.hi, true);
    return this.raw(chunk);
  }
  /**
   * Write a `int64` value, a signed 64-bit varint.
   */
  int64(value) {
    let long = PbLong.from(value);
    varint64write(long.lo, long.hi, this.buf);
    return this;
  }
  /**
   * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64(value) {
    let long = PbLong.from(value), sign = long.hi >> 31, lo = long.lo << 1 ^ sign, hi = (long.hi << 1 | long.lo >>> 31) ^ sign;
    varint64write(lo, hi, this.buf);
    return this;
  }
  /**
   * Write a `uint64` value, an unsigned 64-bit varint.
   */
  uint64(value) {
    let long = PbULong.from(value);
    varint64write(long.lo, long.hi, this.buf);
    return this;
  }
};

// node_modules/@protobuf-ts/runtime/build/es2015/json-format-contract.js
var defaultsWrite2 = {
  emitDefaultValues: false,
  enumAsInteger: false,
  useProtoFieldName: false,
  prettySpaces: 0
};
var defaultsRead2 = {
  ignoreUnknownFields: false
};
function jsonReadOptions(options) {
  return options ? Object.assign(Object.assign({}, defaultsRead2), options) : defaultsRead2;
}
function jsonWriteOptions(options) {
  return options ? Object.assign(Object.assign({}, defaultsWrite2), options) : defaultsWrite2;
}
function mergeJsonOptions(a, b) {
  var _a, _b;
  let c = Object.assign(Object.assign({}, a), b);
  c.typeRegistry = [...(_a = a === null || a === void 0 ? void 0 : a.typeRegistry) !== null && _a !== void 0 ? _a : [], ...(_b = b === null || b === void 0 ? void 0 : b.typeRegistry) !== null && _b !== void 0 ? _b : []];
  return c;
}

// node_modules/@protobuf-ts/runtime/build/es2015/message-type-contract.js
var MESSAGE_TYPE = Symbol.for("protobuf-ts/message-type");

// node_modules/@protobuf-ts/runtime/build/es2015/lower-camel-case.js
function lowerCamelCase(snakeCase) {
  let capNext = false;
  const sb = [];
  for (let i = 0; i < snakeCase.length; i++) {
    let next = snakeCase.charAt(i);
    if (next == "_") {
      capNext = true;
    } else if (/\d/.test(next)) {
      sb.push(next);
      capNext = true;
    } else if (capNext) {
      sb.push(next.toUpperCase());
      capNext = false;
    } else if (i == 0) {
      sb.push(next.toLowerCase());
    } else {
      sb.push(next);
    }
  }
  return sb.join("");
}

// node_modules/@protobuf-ts/runtime/build/es2015/reflection-info.js
var ScalarType;
(function(ScalarType2) {
  ScalarType2[ScalarType2["DOUBLE"] = 1] = "DOUBLE";
  ScalarType2[ScalarType2["FLOAT"] = 2] = "FLOAT";
  ScalarType2[ScalarType2["INT64"] = 3] = "INT64";
  ScalarType2[ScalarType2["UINT64"] = 4] = "UINT64";
  ScalarType2[ScalarType2["INT32"] = 5] = "INT32";
  ScalarType2[ScalarType2["FIXED64"] = 6] = "FIXED64";
  ScalarType2[ScalarType2["FIXED32"] = 7] = "FIXED32";
  ScalarType2[ScalarType2["BOOL"] = 8] = "BOOL";
  ScalarType2[ScalarType2["STRING"] = 9] = "STRING";
  ScalarType2[ScalarType2["BYTES"] = 12] = "BYTES";
  ScalarType2[ScalarType2["UINT32"] = 13] = "UINT32";
  ScalarType2[ScalarType2["SFIXED32"] = 15] = "SFIXED32";
  ScalarType2[ScalarType2["SFIXED64"] = 16] = "SFIXED64";
  ScalarType2[ScalarType2["SINT32"] = 17] = "SINT32";
  ScalarType2[ScalarType2["SINT64"] = 18] = "SINT64";
})(ScalarType || (ScalarType = {}));
var LongType;
(function(LongType2) {
  LongType2[LongType2["BIGINT"] = 0] = "BIGINT";
  LongType2[LongType2["STRING"] = 1] = "STRING";
  LongType2[LongType2["NUMBER"] = 2] = "NUMBER";
})(LongType || (LongType = {}));
var RepeatType;
(function(RepeatType2) {
  RepeatType2[RepeatType2["NO"] = 0] = "NO";
  RepeatType2[RepeatType2["PACKED"] = 1] = "PACKED";
  RepeatType2[RepeatType2["UNPACKED"] = 2] = "UNPACKED";
})(RepeatType || (RepeatType = {}));
function normalizeFieldInfo(field) {
  var _a, _b, _c, _d;
  field.localName = (_a = field.localName) !== null && _a !== void 0 ? _a : lowerCamelCase(field.name);
  field.jsonName = (_b = field.jsonName) !== null && _b !== void 0 ? _b : lowerCamelCase(field.name);
  field.repeat = (_c = field.repeat) !== null && _c !== void 0 ? _c : RepeatType.NO;
  field.opt = (_d = field.opt) !== null && _d !== void 0 ? _d : field.repeat ? false : field.oneof ? false : field.kind == "message";
  return field;
}

// node_modules/@protobuf-ts/runtime/build/es2015/oneof.js
function isOneofGroup(any) {
  if (typeof any != "object" || any === null || !any.hasOwnProperty("oneofKind")) {
    return false;
  }
  switch (typeof any.oneofKind) {
    case "string":
      if (any[any.oneofKind] === void 0) return false;
      return Object.keys(any).length == 2;
    case "undefined":
      return Object.keys(any).length == 1;
    default:
      return false;
  }
}

// node_modules/@protobuf-ts/runtime/build/es2015/reflection-type-check.js
var ReflectionTypeCheck = class {
  constructor(info) {
    var _a;
    this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
  }
  prepare() {
    if (this.data) return;
    const req = [], known = [], oneofs = [];
    for (let field of this.fields) {
      if (field.oneof) {
        if (!oneofs.includes(field.oneof)) {
          oneofs.push(field.oneof);
          req.push(field.oneof);
          known.push(field.oneof);
        }
      } else {
        known.push(field.localName);
        switch (field.kind) {
          case "scalar":
          case "enum":
            if (!field.opt || field.repeat) req.push(field.localName);
            break;
          case "message":
            if (field.repeat) req.push(field.localName);
            break;
          case "map":
            req.push(field.localName);
            break;
        }
      }
    }
    this.data = {
      req,
      known,
      oneofs: Object.values(oneofs)
    };
  }
  /**
   * Is the argument a valid message as specified by the
   * reflection information?
   *
   * Checks all field types recursively. The `depth`
   * specifies how deep into the structure the check will be.
   *
   * With a depth of 0, only the presence of fields
   * is checked.
   *
   * With a depth of 1 or more, the field types are checked.
   *
   * With a depth of 2 or more, the members of map, repeated
   * and message fields are checked.
   *
   * Message fields will be checked recursively with depth - 1.
   *
   * The number of map entries / repeated values being checked
   * is < depth.
   */
  is(message, depth, allowExcessProperties = false) {
    if (depth < 0) return true;
    if (message === null || message === void 0 || typeof message != "object") return false;
    this.prepare();
    let keys = Object.keys(message), data = this.data;
    if (keys.length < data.req.length || data.req.some((n) => !keys.includes(n))) return false;
    if (!allowExcessProperties) {
      if (keys.some((k) => !data.known.includes(k))) return false;
    }
    if (depth < 1) {
      return true;
    }
    for (const name2 of data.oneofs) {
      const group = message[name2];
      if (!isOneofGroup(group)) return false;
      if (group.oneofKind === void 0) continue;
      const field = this.fields.find((f) => f.localName === group.oneofKind);
      if (!field) return false;
      if (!this.field(group[group.oneofKind], field, allowExcessProperties, depth)) return false;
    }
    for (const field of this.fields) {
      if (field.oneof !== void 0) continue;
      if (!this.field(message[field.localName], field, allowExcessProperties, depth)) return false;
    }
    return true;
  }
  field(arg, field, allowExcessProperties, depth) {
    let repeated = field.repeat;
    switch (field.kind) {
      case "scalar":
        if (arg === void 0) return field.opt;
        if (repeated) return this.scalars(arg, field.T, depth, field.L);
        return this.scalar(arg, field.T, field.L);
      case "enum":
        if (arg === void 0) return field.opt;
        if (repeated) return this.scalars(arg, ScalarType.INT32, depth);
        return this.scalar(arg, ScalarType.INT32);
      case "message":
        if (arg === void 0) return true;
        if (repeated) return this.messages(arg, field.T(), allowExcessProperties, depth);
        return this.message(arg, field.T(), allowExcessProperties, depth);
      case "map":
        if (typeof arg != "object" || arg === null) return false;
        if (depth < 2) return true;
        if (!this.mapKeys(arg, field.K, depth)) return false;
        switch (field.V.kind) {
          case "scalar":
            return this.scalars(Object.values(arg), field.V.T, depth, field.V.L);
          case "enum":
            return this.scalars(Object.values(arg), ScalarType.INT32, depth);
          case "message":
            return this.messages(Object.values(arg), field.V.T(), allowExcessProperties, depth);
        }
        break;
    }
    return true;
  }
  message(arg, type, allowExcessProperties, depth) {
    if (allowExcessProperties) {
      return type.isAssignable(arg, depth);
    }
    return type.is(arg, depth);
  }
  messages(arg, type, allowExcessProperties, depth) {
    if (!Array.isArray(arg)) return false;
    if (depth < 2) return true;
    if (allowExcessProperties) {
      for (let i = 0; i < arg.length && i < depth; i++) if (!type.isAssignable(arg[i], depth - 1)) return false;
    } else {
      for (let i = 0; i < arg.length && i < depth; i++) if (!type.is(arg[i], depth - 1)) return false;
    }
    return true;
  }
  scalar(arg, type, longType) {
    let argType = typeof arg;
    switch (type) {
      case ScalarType.UINT64:
      case ScalarType.FIXED64:
      case ScalarType.INT64:
      case ScalarType.SFIXED64:
      case ScalarType.SINT64:
        switch (longType) {
          case LongType.BIGINT:
            return argType == "bigint";
          case LongType.NUMBER:
            return argType == "number" && !isNaN(arg);
          default:
            return argType == "string";
        }
      case ScalarType.BOOL:
        return argType == "boolean";
      case ScalarType.STRING:
        return argType == "string";
      case ScalarType.BYTES:
        return arg instanceof Uint8Array;
      case ScalarType.DOUBLE:
      case ScalarType.FLOAT:
        return argType == "number" && !isNaN(arg);
      default:
        return argType == "number" && Number.isInteger(arg);
    }
  }
  scalars(arg, type, depth, longType) {
    if (!Array.isArray(arg)) return false;
    if (depth < 2) return true;
    if (Array.isArray(arg)) {
      for (let i = 0; i < arg.length && i < depth; i++) if (!this.scalar(arg[i], type, longType)) return false;
    }
    return true;
  }
  mapKeys(map2, type, depth) {
    let keys = Object.keys(map2);
    switch (type) {
      case ScalarType.INT32:
      case ScalarType.FIXED32:
      case ScalarType.SFIXED32:
      case ScalarType.SINT32:
      case ScalarType.UINT32:
        return this.scalars(keys.slice(0, depth).map((k) => parseInt(k)), type, depth);
      case ScalarType.BOOL:
        return this.scalars(keys.slice(0, depth).map((k) => k == "true" ? true : k == "false" ? false : k), type, depth);
      default:
        return this.scalars(keys, type, depth, LongType.STRING);
    }
  }
};

// node_modules/@protobuf-ts/runtime/build/es2015/reflection-long-convert.js
function reflectionLongConvert(long, type) {
  switch (type) {
    case LongType.BIGINT:
      return long.toBigInt();
    case LongType.NUMBER:
      return long.toNumber();
    default:
      return long.toString();
  }
}

// node_modules/@protobuf-ts/runtime/build/es2015/reflection-json-reader.js
var ReflectionJsonReader = class {
  constructor(info) {
    this.info = info;
  }
  prepare() {
    var _a;
    if (this.fMap === void 0) {
      this.fMap = {};
      const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
      for (const field of fieldsInput) {
        this.fMap[field.name] = field;
        this.fMap[field.jsonName] = field;
        this.fMap[field.localName] = field;
      }
    }
  }
  // Cannot parse JSON <type of jsonValue> for <type name>#<fieldName>.
  assert(condition, fieldName, jsonValue) {
    if (!condition) {
      let what = typeofJsonValue(jsonValue);
      if (what == "number" || what == "boolean") what = jsonValue.toString();
      throw new Error(`Cannot parse JSON ${what} for ${this.info.typeName}#${fieldName}`);
    }
  }
  /**
   * Reads a message from canonical JSON format into the target message.
   *
   * Repeated fields are appended. Map entries are added, overwriting
   * existing keys.
   *
   * If a message field is already present, it will be merged with the
   * new data.
   */
  read(input, message, options) {
    this.prepare();
    const oneofsHandled = [];
    for (const [jsonKey, jsonValue] of Object.entries(input)) {
      const field = this.fMap[jsonKey];
      if (!field) {
        if (!options.ignoreUnknownFields) throw new Error(`Found unknown field while reading ${this.info.typeName} from JSON format. JSON key: ${jsonKey}`);
        continue;
      }
      const localName = field.localName;
      let target;
      if (field.oneof) {
        if (jsonValue === null && (field.kind !== "enum" || field.T()[0] !== "google.protobuf.NullValue")) {
          continue;
        }
        if (oneofsHandled.includes(field.oneof)) throw new Error(`Multiple members of the oneof group "${field.oneof}" of ${this.info.typeName} are present in JSON.`);
        oneofsHandled.push(field.oneof);
        target = message[field.oneof] = {
          oneofKind: localName
        };
      } else {
        target = message;
      }
      if (field.kind == "map") {
        if (jsonValue === null) {
          continue;
        }
        this.assert(isJsonObject(jsonValue), field.name, jsonValue);
        const fieldObj = target[localName];
        for (const [jsonObjKey, jsonObjValue] of Object.entries(jsonValue)) {
          this.assert(jsonObjValue !== null, field.name + " map value", null);
          let val;
          switch (field.V.kind) {
            case "message":
              val = field.V.T().internalJsonRead(jsonObjValue, options);
              break;
            case "enum":
              val = this.enum(field.V.T(), jsonObjValue, field.name, options.ignoreUnknownFields);
              if (val === false) continue;
              break;
            case "scalar":
              val = this.scalar(jsonObjValue, field.V.T, field.V.L, field.name);
              break;
          }
          this.assert(val !== void 0, field.name + " map value", jsonObjValue);
          let key = jsonObjKey;
          if (field.K == ScalarType.BOOL) key = key == "true" ? true : key == "false" ? false : key;
          key = this.scalar(key, field.K, LongType.STRING, field.name).toString();
          fieldObj[key] = val;
        }
      } else if (field.repeat) {
        if (jsonValue === null) continue;
        this.assert(Array.isArray(jsonValue), field.name, jsonValue);
        const fieldArr = target[localName];
        for (const jsonItem of jsonValue) {
          this.assert(jsonItem !== null, field.name, null);
          let val;
          switch (field.kind) {
            case "message":
              val = field.T().internalJsonRead(jsonItem, options);
              break;
            case "enum":
              val = this.enum(field.T(), jsonItem, field.name, options.ignoreUnknownFields);
              if (val === false) continue;
              break;
            case "scalar":
              val = this.scalar(jsonItem, field.T, field.L, field.name);
              break;
          }
          this.assert(val !== void 0, field.name, jsonValue);
          fieldArr.push(val);
        }
      } else {
        switch (field.kind) {
          case "message":
            if (jsonValue === null && field.T().typeName != "google.protobuf.Value") {
              this.assert(field.oneof === void 0, field.name + " (oneof member)", null);
              continue;
            }
            target[localName] = field.T().internalJsonRead(jsonValue, options, target[localName]);
            break;
          case "enum":
            let val = this.enum(field.T(), jsonValue, field.name, options.ignoreUnknownFields);
            if (val === false) continue;
            target[localName] = val;
            break;
          case "scalar":
            target[localName] = this.scalar(jsonValue, field.T, field.L, field.name);
            break;
        }
      }
    }
  }
  /**
   * Returns `false` for unrecognized string representations.
   *
   * google.protobuf.NullValue accepts only JSON `null` (or the old `"NULL_VALUE"`).
   */
  enum(type, json, fieldName, ignoreUnknownFields) {
    if (type[0] == "google.protobuf.NullValue") assert(json === null || json === "NULL_VALUE", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} only accepts null.`);
    if (json === null)
      return 0;
    switch (typeof json) {
      case "number":
        assert(Number.isInteger(json), `Unable to parse field ${this.info.typeName}#${fieldName}, enum can only be integral number, got ${json}.`);
        return json;
      case "string":
        let localEnumName = json;
        if (type[2] && json.substring(0, type[2].length) === type[2])
          localEnumName = json.substring(type[2].length);
        let enumNumber = type[1][localEnumName];
        if (typeof enumNumber === "undefined" && ignoreUnknownFields) {
          return false;
        }
        assert(typeof enumNumber == "number", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} has no value for "${json}".`);
        return enumNumber;
    }
    assert(false, `Unable to parse field ${this.info.typeName}#${fieldName}, cannot parse enum value from ${typeof json}".`);
  }
  scalar(json, type, longType, fieldName) {
    let e;
    try {
      switch (type) {
        case ScalarType.DOUBLE:
        case ScalarType.FLOAT:
          if (json === null) return 0;
          if (json === "NaN") return Number.NaN;
          if (json === "Infinity") return Number.POSITIVE_INFINITY;
          if (json === "-Infinity") return Number.NEGATIVE_INFINITY;
          if (json === "") {
            e = "empty string";
            break;
          }
          if (typeof json == "string" && json.trim().length !== json.length) {
            e = "extra whitespace";
            break;
          }
          if (typeof json != "string" && typeof json != "number") {
            break;
          }
          let float = Number(json);
          if (Number.isNaN(float)) {
            e = "not a number";
            break;
          }
          if (!Number.isFinite(float)) {
            e = "too large or small";
            break;
          }
          if (type == ScalarType.FLOAT) assertFloat32(float);
          return float;
        case ScalarType.INT32:
        case ScalarType.FIXED32:
        case ScalarType.SFIXED32:
        case ScalarType.SINT32:
        case ScalarType.UINT32:
          if (json === null) return 0;
          let int32;
          if (typeof json == "number") int32 = json;
          else if (json === "") e = "empty string";
          else if (typeof json == "string") {
            if (json.trim().length !== json.length) e = "extra whitespace";
            else int32 = Number(json);
          }
          if (int32 === void 0) break;
          if (type == ScalarType.UINT32) assertUInt32(int32);
          else assertInt32(int32);
          return int32;
        case ScalarType.INT64:
        case ScalarType.SFIXED64:
        case ScalarType.SINT64:
          if (json === null) return reflectionLongConvert(PbLong.ZERO, longType);
          if (typeof json != "number" && typeof json != "string") break;
          return reflectionLongConvert(PbLong.from(json), longType);
        case ScalarType.FIXED64:
        case ScalarType.UINT64:
          if (json === null) return reflectionLongConvert(PbULong.ZERO, longType);
          if (typeof json != "number" && typeof json != "string") break;
          return reflectionLongConvert(PbULong.from(json), longType);
        case ScalarType.BOOL:
          if (json === null) return false;
          if (typeof json !== "boolean") break;
          return json;
        case ScalarType.STRING:
          if (json === null) return "";
          if (typeof json !== "string") {
            e = "extra whitespace";
            break;
          }
          try {
            encodeURIComponent(json);
          } catch (e2) {
            e2 = "invalid UTF8";
            break;
          }
          return json;
        case ScalarType.BYTES:
          if (json === null || json === "") return new Uint8Array(0);
          if (typeof json !== "string") break;
          return base64decode(json);
      }
    } catch (error) {
      e = error.message;
    }
    this.assert(false, fieldName + (e ? " - " + e : ""), json);
  }
};

// node_modules/@protobuf-ts/runtime/build/es2015/reflection-json-writer.js
var ReflectionJsonWriter = class {
  constructor(info) {
    var _a;
    this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
  }
  /**
   * Converts the message to a JSON object, based on the field descriptors.
   */
  write(message, options) {
    const json = {}, source = message;
    for (const field of this.fields) {
      if (!field.oneof) {
        let jsonValue2 = this.field(field, source[field.localName], options);
        if (jsonValue2 !== void 0) json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue2;
        continue;
      }
      const group = source[field.oneof];
      if (group.oneofKind !== field.localName) continue;
      const opt = field.kind == "scalar" || field.kind == "enum" ? Object.assign(Object.assign({}, options), {
        emitDefaultValues: true
      }) : options;
      let jsonValue = this.field(field, group[field.localName], opt);
      assert(jsonValue !== void 0);
      json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue;
    }
    return json;
  }
  field(field, value, options) {
    let jsonValue = void 0;
    if (field.kind == "map") {
      assert(typeof value == "object" && value !== null);
      const jsonObj = {};
      switch (field.V.kind) {
        case "scalar":
          for (const [entryKey, entryValue] of Object.entries(value)) {
            const val = this.scalar(field.V.T, entryValue, field.name, false, true);
            assert(val !== void 0);
            jsonObj[entryKey.toString()] = val;
          }
          break;
        case "message":
          const messageType = field.V.T();
          for (const [entryKey, entryValue] of Object.entries(value)) {
            const val = this.message(messageType, entryValue, field.name, options);
            assert(val !== void 0);
            jsonObj[entryKey.toString()] = val;
          }
          break;
        case "enum":
          const enumInfo = field.V.T();
          for (const [entryKey, entryValue] of Object.entries(value)) {
            assert(entryValue === void 0 || typeof entryValue == "number");
            const val = this.enum(enumInfo, entryValue, field.name, false, true, options.enumAsInteger);
            assert(val !== void 0);
            jsonObj[entryKey.toString()] = val;
          }
          break;
      }
      if (options.emitDefaultValues || Object.keys(jsonObj).length > 0) jsonValue = jsonObj;
    } else if (field.repeat) {
      assert(Array.isArray(value));
      const jsonArr = [];
      switch (field.kind) {
        case "scalar":
          for (let i = 0; i < value.length; i++) {
            const val = this.scalar(field.T, value[i], field.name, field.opt, true);
            assert(val !== void 0);
            jsonArr.push(val);
          }
          break;
        case "enum":
          const enumInfo = field.T();
          for (let i = 0; i < value.length; i++) {
            assert(value[i] === void 0 || typeof value[i] == "number");
            const val = this.enum(enumInfo, value[i], field.name, field.opt, true, options.enumAsInteger);
            assert(val !== void 0);
            jsonArr.push(val);
          }
          break;
        case "message":
          const messageType = field.T();
          for (let i = 0; i < value.length; i++) {
            const val = this.message(messageType, value[i], field.name, options);
            assert(val !== void 0);
            jsonArr.push(val);
          }
          break;
      }
      if (options.emitDefaultValues || jsonArr.length > 0 || options.emitDefaultValues) jsonValue = jsonArr;
    } else {
      switch (field.kind) {
        case "scalar":
          jsonValue = this.scalar(field.T, value, field.name, field.opt, options.emitDefaultValues);
          break;
        case "enum":
          jsonValue = this.enum(field.T(), value, field.name, field.opt, options.emitDefaultValues, options.enumAsInteger);
          break;
        case "message":
          jsonValue = this.message(field.T(), value, field.name, options);
          break;
      }
    }
    return jsonValue;
  }
  /**
   * Returns `null` as the default for google.protobuf.NullValue.
   */
  enum(type, value, fieldName, optional, emitDefaultValues, enumAsInteger) {
    if (type[0] == "google.protobuf.NullValue") return !emitDefaultValues && !optional ? void 0 : null;
    if (value === void 0) {
      assert(optional);
      return void 0;
    }
    if (value === 0 && !emitDefaultValues && !optional)
      return void 0;
    assert(typeof value == "number");
    assert(Number.isInteger(value));
    if (enumAsInteger || !type[1].hasOwnProperty(value))
      return value;
    if (type[2])
      return type[2] + type[1][value];
    return type[1][value];
  }
  message(type, value, fieldName, options) {
    if (value === void 0) return options.emitDefaultValues ? null : void 0;
    return type.internalJsonWrite(value, options);
  }
  scalar(type, value, fieldName, optional, emitDefaultValues) {
    if (value === void 0) {
      assert(optional);
      return void 0;
    }
    const ed = emitDefaultValues || optional;
    switch (type) {
      case ScalarType.INT32:
      case ScalarType.SFIXED32:
      case ScalarType.SINT32:
        if (value === 0) return ed ? 0 : void 0;
        assertInt32(value);
        return value;
      case ScalarType.FIXED32:
      case ScalarType.UINT32:
        if (value === 0) return ed ? 0 : void 0;
        assertUInt32(value);
        return value;
      case ScalarType.FLOAT:
        assertFloat32(value);
      case ScalarType.DOUBLE:
        if (value === 0) return ed ? 0 : void 0;
        assert(typeof value == "number");
        if (Number.isNaN(value)) return "NaN";
        if (value === Number.POSITIVE_INFINITY) return "Infinity";
        if (value === Number.NEGATIVE_INFINITY) return "-Infinity";
        return value;
      case ScalarType.STRING:
        if (value === "") return ed ? "" : void 0;
        assert(typeof value == "string");
        return value;
      case ScalarType.BOOL:
        if (value === false) return ed ? false : void 0;
        assert(typeof value == "boolean");
        return value;
      case ScalarType.UINT64:
      case ScalarType.FIXED64:
        assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
        let ulong = PbULong.from(value);
        if (ulong.isZero() && !ed) return void 0;
        return ulong.toString();
      case ScalarType.INT64:
      case ScalarType.SFIXED64:
      case ScalarType.SINT64:
        assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
        let long = PbLong.from(value);
        if (long.isZero() && !ed) return void 0;
        return long.toString();
      case ScalarType.BYTES:
        assert(value instanceof Uint8Array);
        if (!value.byteLength) return ed ? "" : void 0;
        return base64encode(value);
    }
  }
};

// node_modules/@protobuf-ts/runtime/build/es2015/reflection-scalar-default.js
function reflectionScalarDefault(type, longType = LongType.STRING) {
  switch (type) {
    case ScalarType.BOOL:
      return false;
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
      return reflectionLongConvert(PbULong.ZERO, longType);
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      return reflectionLongConvert(PbLong.ZERO, longType);
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      return 0;
    case ScalarType.BYTES:
      return new Uint8Array(0);
    case ScalarType.STRING:
      return "";
    default:
      return 0;
  }
}

// node_modules/@protobuf-ts/runtime/build/es2015/reflection-binary-reader.js
var ReflectionBinaryReader = class {
  constructor(info) {
    this.info = info;
  }
  prepare() {
    var _a;
    if (!this.fieldNoToField) {
      const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
      this.fieldNoToField = new Map(fieldsInput.map((field) => [field.no, field]));
    }
  }
  /**
   * Reads a message from binary format into the target message.
   *
   * Repeated fields are appended. Map entries are added, overwriting
   * existing keys.
   *
   * If a message field is already present, it will be merged with the
   * new data.
   */
  read(reader, message, options, length) {
    this.prepare();
    const end = length === void 0 ? reader.len : reader.pos + length;
    while (reader.pos < end) {
      const [fieldNo, wireType] = reader.tag(), field = this.fieldNoToField.get(fieldNo);
      if (!field) {
        let u = options.readUnknownField;
        if (u == "throw") throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.info.typeName}`);
        let d = reader.skip(wireType);
        if (u !== false) (u === true ? UnknownFieldHandler.onRead : u)(this.info.typeName, message, fieldNo, wireType, d);
        continue;
      }
      let target = message, repeated = field.repeat, localName = field.localName;
      if (field.oneof) {
        target = target[field.oneof];
        if (target.oneofKind !== localName) target = message[field.oneof] = {
          oneofKind: localName
        };
      }
      switch (field.kind) {
        case "scalar":
        case "enum":
          let T = field.kind == "enum" ? ScalarType.INT32 : field.T;
          let L = field.kind == "scalar" ? field.L : void 0;
          if (repeated) {
            let arr = target[localName];
            if (wireType == WireType.LengthDelimited && T != ScalarType.STRING && T != ScalarType.BYTES) {
              let e = reader.uint32() + reader.pos;
              while (reader.pos < e) arr.push(this.scalar(reader, T, L));
            } else arr.push(this.scalar(reader, T, L));
          } else target[localName] = this.scalar(reader, T, L);
          break;
        case "message":
          if (repeated) {
            let arr = target[localName];
            let msg = field.T().internalBinaryRead(reader, reader.uint32(), options);
            arr.push(msg);
          } else target[localName] = field.T().internalBinaryRead(reader, reader.uint32(), options, target[localName]);
          break;
        case "map":
          let [mapKey, mapVal] = this.mapEntry(field, reader, options);
          target[localName][mapKey] = mapVal;
          break;
      }
    }
  }
  /**
   * Read a map field, expecting key field = 1, value field = 2
   */
  mapEntry(field, reader, options) {
    let length = reader.uint32();
    let end = reader.pos + length;
    let key = void 0;
    let val = void 0;
    while (reader.pos < end) {
      let [fieldNo, wireType] = reader.tag();
      switch (fieldNo) {
        case 1:
          if (field.K == ScalarType.BOOL) key = reader.bool().toString();
          else
            key = this.scalar(reader, field.K, LongType.STRING);
          break;
        case 2:
          switch (field.V.kind) {
            case "scalar":
              val = this.scalar(reader, field.V.T, field.V.L);
              break;
            case "enum":
              val = reader.int32();
              break;
            case "message":
              val = field.V.T().internalBinaryRead(reader, reader.uint32(), options);
              break;
          }
          break;
        default:
          throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) in map entry for ${this.info.typeName}#${field.name}`);
      }
    }
    if (key === void 0) {
      let keyRaw = reflectionScalarDefault(field.K);
      key = field.K == ScalarType.BOOL ? keyRaw.toString() : keyRaw;
    }
    if (val === void 0) switch (field.V.kind) {
      case "scalar":
        val = reflectionScalarDefault(field.V.T, field.V.L);
        break;
      case "enum":
        val = 0;
        break;
      case "message":
        val = field.V.T().create();
        break;
    }
    return [key, val];
  }
  scalar(reader, type, longType) {
    switch (type) {
      case ScalarType.INT32:
        return reader.int32();
      case ScalarType.STRING:
        return reader.string();
      case ScalarType.BOOL:
        return reader.bool();
      case ScalarType.DOUBLE:
        return reader.double();
      case ScalarType.FLOAT:
        return reader.float();
      case ScalarType.INT64:
        return reflectionLongConvert(reader.int64(), longType);
      case ScalarType.UINT64:
        return reflectionLongConvert(reader.uint64(), longType);
      case ScalarType.FIXED64:
        return reflectionLongConvert(reader.fixed64(), longType);
      case ScalarType.FIXED32:
        return reader.fixed32();
      case ScalarType.BYTES:
        return reader.bytes();
      case ScalarType.UINT32:
        return reader.uint32();
      case ScalarType.SFIXED32:
        return reader.sfixed32();
      case ScalarType.SFIXED64:
        return reflectionLongConvert(reader.sfixed64(), longType);
      case ScalarType.SINT32:
        return reader.sint32();
      case ScalarType.SINT64:
        return reflectionLongConvert(reader.sint64(), longType);
    }
  }
};

// node_modules/@protobuf-ts/runtime/build/es2015/reflection-binary-writer.js
var ReflectionBinaryWriter = class {
  constructor(info) {
    this.info = info;
  }
  prepare() {
    if (!this.fields) {
      const fieldsInput = this.info.fields ? this.info.fields.concat() : [];
      this.fields = fieldsInput.sort((a, b) => a.no - b.no);
    }
  }
  /**
   * Writes the message to binary format.
   */
  write(message, writer, options) {
    this.prepare();
    for (const field of this.fields) {
      let value, emitDefault, repeated = field.repeat, localName = field.localName;
      if (field.oneof) {
        const group = message[field.oneof];
        if (group.oneofKind !== localName) continue;
        value = group[localName];
        emitDefault = true;
      } else {
        value = message[localName];
        emitDefault = false;
      }
      switch (field.kind) {
        case "scalar":
        case "enum":
          let T = field.kind == "enum" ? ScalarType.INT32 : field.T;
          if (repeated) {
            assert(Array.isArray(value));
            if (repeated == RepeatType.PACKED) this.packed(writer, T, field.no, value);
            else for (const item of value) this.scalar(writer, T, field.no, item, true);
          } else if (value === void 0) assert(field.opt);
          else this.scalar(writer, T, field.no, value, emitDefault || field.opt);
          break;
        case "message":
          if (repeated) {
            assert(Array.isArray(value));
            for (const item of value) this.message(writer, options, field.T(), field.no, item);
          } else {
            this.message(writer, options, field.T(), field.no, value);
          }
          break;
        case "map":
          assert(typeof value == "object" && value !== null);
          for (const [key, val] of Object.entries(value)) this.mapEntry(writer, options, field, key, val);
          break;
      }
    }
    let u = options.writeUnknownFields;
    if (u !== false) (u === true ? UnknownFieldHandler.onWrite : u)(this.info.typeName, message, writer);
  }
  mapEntry(writer, options, field, key, value) {
    writer.tag(field.no, WireType.LengthDelimited);
    writer.fork();
    let keyValue = key;
    switch (field.K) {
      case ScalarType.INT32:
      case ScalarType.FIXED32:
      case ScalarType.UINT32:
      case ScalarType.SFIXED32:
      case ScalarType.SINT32:
        keyValue = Number.parseInt(key);
        break;
      case ScalarType.BOOL:
        assert(key == "true" || key == "false");
        keyValue = key == "true";
        break;
    }
    this.scalar(writer, field.K, 1, keyValue, true);
    switch (field.V.kind) {
      case "scalar":
        this.scalar(writer, field.V.T, 2, value, true);
        break;
      case "enum":
        this.scalar(writer, ScalarType.INT32, 2, value, true);
        break;
      case "message":
        this.message(writer, options, field.V.T(), 2, value);
        break;
    }
    writer.join();
  }
  message(writer, options, handler, fieldNo, value) {
    if (value === void 0) return;
    handler.internalBinaryWrite(value, writer.tag(fieldNo, WireType.LengthDelimited).fork(), options);
    writer.join();
  }
  /**
   * Write a single scalar value.
   */
  scalar(writer, type, fieldNo, value, emitDefault) {
    let [wireType, method, isDefault] = this.scalarInfo(type, value);
    if (!isDefault || emitDefault) {
      writer.tag(fieldNo, wireType);
      writer[method](value);
    }
  }
  /**
   * Write an array of scalar values in packed format.
   */
  packed(writer, type, fieldNo, value) {
    if (!value.length) return;
    assert(type !== ScalarType.BYTES && type !== ScalarType.STRING);
    writer.tag(fieldNo, WireType.LengthDelimited);
    writer.fork();
    let [, method] = this.scalarInfo(type);
    for (let i = 0; i < value.length; i++) writer[method](value[i]);
    writer.join();
  }
  /**
   * Get information for writing a scalar value.
   *
   * Returns tuple:
   * [0]: appropriate WireType
   * [1]: name of the appropriate method of IBinaryWriter
   * [2]: whether the given value is a default value
   *
   * If argument `value` is omitted, [2] is always false.
   */
  scalarInfo(type, value) {
    let t = WireType.Varint;
    let m;
    let i = value === void 0;
    let d = value === 0;
    switch (type) {
      case ScalarType.INT32:
        m = "int32";
        break;
      case ScalarType.STRING:
        d = i || !value.length;
        t = WireType.LengthDelimited;
        m = "string";
        break;
      case ScalarType.BOOL:
        d = value === false;
        m = "bool";
        break;
      case ScalarType.UINT32:
        m = "uint32";
        break;
      case ScalarType.DOUBLE:
        t = WireType.Bit64;
        m = "double";
        break;
      case ScalarType.FLOAT:
        t = WireType.Bit32;
        m = "float";
        break;
      case ScalarType.INT64:
        d = i || PbLong.from(value).isZero();
        m = "int64";
        break;
      case ScalarType.UINT64:
        d = i || PbULong.from(value).isZero();
        m = "uint64";
        break;
      case ScalarType.FIXED64:
        d = i || PbULong.from(value).isZero();
        t = WireType.Bit64;
        m = "fixed64";
        break;
      case ScalarType.BYTES:
        d = i || !value.byteLength;
        t = WireType.LengthDelimited;
        m = "bytes";
        break;
      case ScalarType.FIXED32:
        t = WireType.Bit32;
        m = "fixed32";
        break;
      case ScalarType.SFIXED32:
        t = WireType.Bit32;
        m = "sfixed32";
        break;
      case ScalarType.SFIXED64:
        d = i || PbLong.from(value).isZero();
        t = WireType.Bit64;
        m = "sfixed64";
        break;
      case ScalarType.SINT32:
        m = "sint32";
        break;
      case ScalarType.SINT64:
        d = i || PbLong.from(value).isZero();
        m = "sint64";
        break;
    }
    return [t, m, i || d];
  }
};

// node_modules/@protobuf-ts/runtime/build/es2015/reflection-create.js
function reflectionCreate(type) {
  const msg = type.messagePrototype ? Object.create(type.messagePrototype) : Object.defineProperty({}, MESSAGE_TYPE, {
    value: type
  });
  for (let field of type.fields) {
    let name2 = field.localName;
    if (field.opt) continue;
    if (field.oneof) msg[field.oneof] = {
      oneofKind: void 0
    };
    else if (field.repeat) msg[name2] = [];
    else switch (field.kind) {
      case "scalar":
        msg[name2] = reflectionScalarDefault(field.T, field.L);
        break;
      case "enum":
        msg[name2] = 0;
        break;
      case "map":
        msg[name2] = {};
        break;
    }
  }
  return msg;
}

// node_modules/@protobuf-ts/runtime/build/es2015/reflection-merge-partial.js
function reflectionMergePartial(info, target, source) {
  let fieldValue, input = source, output;
  for (let field of info.fields) {
    let name2 = field.localName;
    if (field.oneof) {
      const group = input[field.oneof];
      if ((group === null || group === void 0 ? void 0 : group.oneofKind) == void 0) {
        continue;
      }
      fieldValue = group[name2];
      output = target[field.oneof];
      output.oneofKind = group.oneofKind;
      if (fieldValue == void 0) {
        delete output[name2];
        continue;
      }
    } else {
      fieldValue = input[name2];
      output = target;
      if (fieldValue == void 0) {
        continue;
      }
    }
    if (field.repeat) output[name2].length = fieldValue.length;
    switch (field.kind) {
      case "scalar":
      case "enum":
        if (field.repeat) for (let i = 0; i < fieldValue.length; i++) output[name2][i] = fieldValue[i];
        else output[name2] = fieldValue;
        break;
      case "message":
        let T = field.T();
        if (field.repeat) for (let i = 0; i < fieldValue.length; i++) output[name2][i] = T.create(fieldValue[i]);
        else if (output[name2] === void 0) output[name2] = T.create(fieldValue);
        else T.mergePartial(output[name2], fieldValue);
        break;
      case "map":
        switch (field.V.kind) {
          case "scalar":
          case "enum":
            Object.assign(output[name2], fieldValue);
            break;
          case "message":
            let T2 = field.V.T();
            for (let k of Object.keys(fieldValue)) output[name2][k] = T2.create(fieldValue[k]);
            break;
        }
        break;
    }
  }
}

// node_modules/@protobuf-ts/runtime/build/es2015/reflection-equals.js
function reflectionEquals(info, a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  for (let field of info.fields) {
    let localName = field.localName;
    let val_a = field.oneof ? a[field.oneof][localName] : a[localName];
    let val_b = field.oneof ? b[field.oneof][localName] : b[localName];
    switch (field.kind) {
      case "enum":
      case "scalar":
        let t = field.kind == "enum" ? ScalarType.INT32 : field.T;
        if (!(field.repeat ? repeatedPrimitiveEq(t, val_a, val_b) : primitiveEq(t, val_a, val_b))) return false;
        break;
      case "map":
        if (!(field.V.kind == "message" ? repeatedMsgEq(field.V.T(), objectValues(val_a), objectValues(val_b)) : repeatedPrimitiveEq(field.V.kind == "enum" ? ScalarType.INT32 : field.V.T, objectValues(val_a), objectValues(val_b)))) return false;
        break;
      case "message":
        let T = field.T();
        if (!(field.repeat ? repeatedMsgEq(T, val_a, val_b) : T.equals(val_a, val_b))) return false;
        break;
    }
  }
  return true;
}
var objectValues = Object.values;
function primitiveEq(type, a, b) {
  if (a === b) return true;
  if (type !== ScalarType.BYTES) return false;
  let ba = a;
  let bb = b;
  if (ba.length !== bb.length) return false;
  for (let i = 0; i < ba.length; i++) if (ba[i] != bb[i]) return false;
  return true;
}
function repeatedPrimitiveEq(type, a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (!primitiveEq(type, a[i], b[i])) return false;
  return true;
}
function repeatedMsgEq(type, a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (!type.equals(a[i], b[i])) return false;
  return true;
}

// node_modules/@protobuf-ts/runtime/build/es2015/message-type.js
var baseDescriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf({}));
var MessageType = class {
  constructor(name2, fields, options) {
    this.defaultCheckDepth = 16;
    this.typeName = name2;
    this.fields = fields.map(normalizeFieldInfo);
    this.options = options !== null && options !== void 0 ? options : {};
    this.messagePrototype = Object.create(null, Object.assign(Object.assign({}, baseDescriptors), {
      [MESSAGE_TYPE]: {
        value: this
      }
    }));
    this.refTypeCheck = new ReflectionTypeCheck(this);
    this.refJsonReader = new ReflectionJsonReader(this);
    this.refJsonWriter = new ReflectionJsonWriter(this);
    this.refBinReader = new ReflectionBinaryReader(this);
    this.refBinWriter = new ReflectionBinaryWriter(this);
  }
  create(value) {
    let message = reflectionCreate(this);
    if (value !== void 0) {
      reflectionMergePartial(this, message, value);
    }
    return message;
  }
  /**
   * Clone the message.
   *
   * Unknown fields are discarded.
   */
  clone(message) {
    let copy2 = this.create();
    reflectionMergePartial(this, copy2, message);
    return copy2;
  }
  /**
   * Determines whether two message of the same type have the same field values.
   * Checks for deep equality, traversing repeated fields, oneof groups, maps
   * and messages recursively.
   * Will also return true if both messages are `undefined`.
   */
  equals(a, b) {
    return reflectionEquals(this, a, b);
  }
  /**
   * Is the given value assignable to our message type
   * and contains no [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
   */
  is(arg, depth = this.defaultCheckDepth) {
    return this.refTypeCheck.is(arg, depth, false);
  }
  /**
   * Is the given value assignable to our message type,
   * regardless of [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
   */
  isAssignable(arg, depth = this.defaultCheckDepth) {
    return this.refTypeCheck.is(arg, depth, true);
  }
  /**
   * Copy partial data into the target message.
   */
  mergePartial(target, source) {
    reflectionMergePartial(this, target, source);
  }
  /**
   * Create a new message from binary format.
   */
  fromBinary(data, options) {
    let opt = binaryReadOptions(options);
    return this.internalBinaryRead(opt.readerFactory(data), data.byteLength, opt);
  }
  /**
   * Read a new message from a JSON value.
   */
  fromJson(json, options) {
    return this.internalJsonRead(json, jsonReadOptions(options));
  }
  /**
   * Read a new message from a JSON string.
   * This is equivalent to `T.fromJson(JSON.parse(json))`.
   */
  fromJsonString(json, options) {
    let value = JSON.parse(json);
    return this.fromJson(value, options);
  }
  /**
   * Write the message to canonical JSON value.
   */
  toJson(message, options) {
    return this.internalJsonWrite(message, jsonWriteOptions(options));
  }
  /**
   * Convert the message to canonical JSON string.
   * This is equivalent to `JSON.stringify(T.toJson(t))`
   */
  toJsonString(message, options) {
    var _a;
    let value = this.toJson(message, options);
    return JSON.stringify(value, null, (_a = options === null || options === void 0 ? void 0 : options.prettySpaces) !== null && _a !== void 0 ? _a : 0);
  }
  /**
   * Write the message to binary format.
   */
  toBinary(message, options) {
    let opt = binaryWriteOptions(options);
    return this.internalBinaryWrite(message, opt.writerFactory(), opt).finish();
  }
  /**
   * This is an internal method. If you just want to read a message from
   * JSON, use `fromJson()` or `fromJsonString()`.
   *
   * Reads JSON value and merges the fields into the target
   * according to protobuf rules. If the target is omitted,
   * a new instance is created first.
   */
  internalJsonRead(json, options, target) {
    if (json !== null && typeof json == "object" && !Array.isArray(json)) {
      let message = target !== null && target !== void 0 ? target : this.create();
      this.refJsonReader.read(json, message, options);
      return message;
    }
    throw new Error(`Unable to parse message ${this.typeName} from JSON ${typeofJsonValue(json)}.`);
  }
  /**
   * This is an internal method. If you just want to write a message
   * to JSON, use `toJson()` or `toJsonString().
   *
   * Writes JSON value and returns it.
   */
  internalJsonWrite(message, options) {
    return this.refJsonWriter.write(message, options);
  }
  /**
   * This is an internal method. If you just want to write a message
   * in binary format, use `toBinary()`.
   *
   * Serializes the message in binary format and appends it to the given
   * writer. Returns passed writer.
   */
  internalBinaryWrite(message, writer, options) {
    this.refBinWriter.write(message, writer, options);
    return writer;
  }
  /**
   * This is an internal method. If you just want to read a message from
   * binary data, use `fromBinary()`.
   *
   * Reads data from binary format and merges the fields into
   * the target according to protobuf rules. If the target is
   * omitted, a new instance is created first.
   */
  internalBinaryRead(reader, length, options, target) {
    let message = target !== null && target !== void 0 ? target : this.create();
    this.refBinReader.read(reader, message, options, length);
    return message;
  }
};

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/reflection-info.js
function normalizeMethodInfo(method, service) {
  var _a, _b, _c;
  let m = method;
  m.service = service;
  m.localName = (_a = m.localName) !== null && _a !== void 0 ? _a : lowerCamelCase(m.name);
  m.serverStreaming = !!m.serverStreaming;
  m.clientStreaming = !!m.clientStreaming;
  m.options = (_b = m.options) !== null && _b !== void 0 ? _b : {};
  m.idempotency = (_c = m.idempotency) !== null && _c !== void 0 ? _c : void 0;
  return m;
}

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/service-type.js
var ServiceType = class {
  constructor(typeName, methods, options) {
    this.typeName = typeName;
    this.methods = methods.map((i) => normalizeMethodInfo(i, this));
    this.options = options !== null && options !== void 0 ? options : {};
  }
};

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/rpc-error.js
var RpcError = class extends Error {
  constructor(message, code = "UNKNOWN", meta) {
    super(message);
    this.name = "RpcError";
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = code;
    this.meta = meta !== null && meta !== void 0 ? meta : {};
  }
  toString() {
    const l = [this.name + ": " + this.message];
    if (this.code) {
      l.push("");
      l.push("Code: " + this.code);
    }
    if (this.serviceName && this.methodName) {
      l.push("Method: " + this.serviceName + "/" + this.methodName);
    }
    let m = Object.entries(this.meta);
    if (m.length) {
      l.push("");
      l.push("Meta:");
      for (let [k, v] of m) {
        l.push(`  ${k}: ${v}`);
      }
    }
    return l.join("\n");
  }
};

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/rpc-options.js
function mergeRpcOptions(defaults, options) {
  if (!options) return defaults;
  let o = {};
  copy(defaults, o);
  copy(options, o);
  for (let key of Object.keys(options)) {
    let val = options[key];
    switch (key) {
      case "jsonOptions":
        o.jsonOptions = mergeJsonOptions(defaults.jsonOptions, o.jsonOptions);
        break;
      case "binaryOptions":
        o.binaryOptions = mergeBinaryOptions(defaults.binaryOptions, o.binaryOptions);
        break;
      case "meta":
        o.meta = {};
        copy(defaults.meta, o.meta);
        copy(options.meta, o.meta);
        break;
      case "interceptors":
        o.interceptors = defaults.interceptors ? defaults.interceptors.concat(val) : val.concat();
        break;
    }
  }
  return o;
}
function copy(a, into) {
  if (!a) return;
  let c = into;
  for (let [k, v] of Object.entries(a)) {
    if (v instanceof Date) c[k] = new Date(v.getTime());
    else if (Array.isArray(v)) c[k] = v.concat();
    else c[k] = v;
  }
}

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/deferred.js
var DeferredState;
(function(DeferredState2) {
  DeferredState2[DeferredState2["PENDING"] = 0] = "PENDING";
  DeferredState2[DeferredState2["REJECTED"] = 1] = "REJECTED";
  DeferredState2[DeferredState2["RESOLVED"] = 2] = "RESOLVED";
})(DeferredState || (DeferredState = {}));
var Deferred = class {
  /**
   * @param preventUnhandledRejectionWarning - prevents the warning
   * "Unhandled Promise rejection" by adding a noop rejection handler.
   * Working with calls returned from the runtime-rpc package in an
   * async function usually means awaiting one call property after
   * the other. This means that the "status" is not being awaited when
   * an earlier await for the "headers" is rejected. This causes the
   * "unhandled promise reject" warning. A more correct behaviour for
   * calls might be to become aware whether at least one of the
   * promises is handled and swallow the rejection warning for the
   * others.
   */
  constructor(preventUnhandledRejectionWarning = true) {
    this._state = DeferredState.PENDING;
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    if (preventUnhandledRejectionWarning) {
      this._promise.catch((_) => {
      });
    }
  }
  /**
   * Get the current state of the promise.
   */
  get state() {
    return this._state;
  }
  /**
   * Get the deferred promise.
   */
  get promise() {
    return this._promise;
  }
  /**
   * Resolve the promise. Throws if the promise is already resolved or rejected.
   */
  resolve(value) {
    if (this.state !== DeferredState.PENDING) throw new Error(`cannot resolve ${DeferredState[this.state].toLowerCase()}`);
    this._resolve(value);
    this._state = DeferredState.RESOLVED;
  }
  /**
   * Reject the promise. Throws if the promise is already resolved or rejected.
   */
  reject(reason) {
    if (this.state !== DeferredState.PENDING) throw new Error(`cannot reject ${DeferredState[this.state].toLowerCase()}`);
    this._reject(reason);
    this._state = DeferredState.REJECTED;
  }
  /**
   * Resolve the promise. Ignore if not pending.
   */
  resolvePending(val) {
    if (this._state === DeferredState.PENDING) this.resolve(val);
  }
  /**
   * Reject the promise. Ignore if not pending.
   */
  rejectPending(reason) {
    if (this._state === DeferredState.PENDING) this.reject(reason);
  }
};

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/rpc-output-stream.js
var RpcOutputStreamController = class {
  constructor() {
    this._lis = {
      nxt: [],
      msg: [],
      err: [],
      cmp: []
    };
    this._closed = false;
  }
  // --- RpcOutputStream callback API
  onNext(callback) {
    return this.addLis(callback, this._lis.nxt);
  }
  onMessage(callback) {
    return this.addLis(callback, this._lis.msg);
  }
  onError(callback) {
    return this.addLis(callback, this._lis.err);
  }
  onComplete(callback) {
    return this.addLis(callback, this._lis.cmp);
  }
  addLis(callback, list) {
    list.push(callback);
    return () => {
      let i = list.indexOf(callback);
      if (i >= 0) list.splice(i, 1);
    };
  }
  // remove all listeners
  clearLis() {
    for (let l of Object.values(this._lis)) l.splice(0, l.length);
  }
  // --- Controller API
  /**
   * Is this stream already closed by a completion or error?
   */
  get closed() {
    return this._closed !== false;
  }
  /**
   * Emit message, close with error, or close successfully, but only one
   * at a time.
   * Can be used to wrap a stream by using the other stream's `onNext`.
   */
  notifyNext(message, error, complete) {
    assert((message ? 1 : 0) + (error ? 1 : 0) + (complete ? 1 : 0) <= 1, "only one emission at a time");
    if (message) this.notifyMessage(message);
    if (error) this.notifyError(error);
    if (complete) this.notifyComplete();
  }
  /**
   * Emits a new message. Throws if stream is closed.
   *
   * Triggers onNext and onMessage callbacks.
   */
  notifyMessage(message) {
    assert(!this.closed, "stream is closed");
    this.pushIt({
      value: message,
      done: false
    });
    this._lis.msg.forEach((l) => l(message));
    this._lis.nxt.forEach((l) => l(message, void 0, false));
  }
  /**
   * Closes the stream with an error. Throws if stream is closed.
   *
   * Triggers onNext and onError callbacks.
   */
  notifyError(error) {
    assert(!this.closed, "stream is closed");
    this._closed = error;
    this.pushIt(error);
    this._lis.err.forEach((l) => l(error));
    this._lis.nxt.forEach((l) => l(void 0, error, false));
    this.clearLis();
  }
  /**
   * Closes the stream successfully. Throws if stream is closed.
   *
   * Triggers onNext and onComplete callbacks.
   */
  notifyComplete() {
    assert(!this.closed, "stream is closed");
    this._closed = true;
    this.pushIt({
      value: null,
      done: true
    });
    this._lis.cmp.forEach((l) => l());
    this._lis.nxt.forEach((l) => l(void 0, void 0, true));
    this.clearLis();
  }
  /**
   * Creates an async iterator (that can be used with `for await {...}`)
   * to consume the stream.
   *
   * Some things to note:
   * - If an error occurs, the `for await` will throw it.
   * - If an error occurred before the `for await` was started, `for await`
   *   will re-throw it.
   * - If the stream is already complete, the `for await` will be empty.
   * - If your `for await` consumes slower than the stream produces,
   *   for example because you are relaying messages in a slow operation,
   *   messages are queued.
   */
  [Symbol.asyncIterator]() {
    if (!this._itState) {
      this._itState = {
        q: []
      };
    }
    if (this._closed === true) this.pushIt({
      value: null,
      done: true
    });
    else if (this._closed !== false) this.pushIt(this._closed);
    return {
      next: () => {
        let state = this._itState;
        assert(state, "bad state");
        assert(!state.p, "iterator contract broken");
        let first = state.q.shift();
        if (first) return "value" in first ? Promise.resolve(first) : Promise.reject(first);
        state.p = new Deferred();
        return state.p.promise;
      }
    };
  }
  // "push" a new iterator result.
  // this either resolves a pending promise, or enqueues the result.
  pushIt(result) {
    let state = this._itState;
    if (!state) return;
    if (state.p) {
      const p = state.p;
      assert(p.state == DeferredState.PENDING, "iterator contract broken");
      "value" in result ? p.resolve(result) : p.reject(result);
      delete state.p;
    } else {
      state.q.push(result);
    }
  }
};

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/unary-call.js
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var UnaryCall = class {
  constructor(method, requestHeaders, request, headers, response, status, trailers) {
    this.method = method;
    this.requestHeaders = requestHeaders;
    this.request = request;
    this.headers = headers;
    this.response = response;
    this.status = status;
    this.trailers = trailers;
  }
  /**
   * If you are only interested in the final outcome of this call,
   * you can await it to receive a `FinishedUnaryCall`.
   */
  then(onfulfilled, onrejected) {
    return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
  }
  promiseFinished() {
    return __awaiter(this, void 0, void 0, function* () {
      let [headers, response, status, trailers] = yield Promise.all([this.headers, this.response, this.status, this.trailers]);
      return {
        method: this.method,
        requestHeaders: this.requestHeaders,
        request: this.request,
        headers,
        response,
        status,
        trailers
      };
    });
  }
};

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/server-streaming-call.js
var __awaiter2 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var ServerStreamingCall = class {
  constructor(method, requestHeaders, request, headers, response, status, trailers) {
    this.method = method;
    this.requestHeaders = requestHeaders;
    this.request = request;
    this.headers = headers;
    this.responses = response;
    this.status = status;
    this.trailers = trailers;
  }
  /**
   * Instead of awaiting the response status and trailers, you can
   * just as well await this call itself to receive the server outcome.
   * You should first setup some listeners to the `request` to
   * see the actual messages the server replied with.
   */
  then(onfulfilled, onrejected) {
    return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
  }
  promiseFinished() {
    return __awaiter2(this, void 0, void 0, function* () {
      let [headers, status, trailers] = yield Promise.all([this.headers, this.status, this.trailers]);
      return {
        method: this.method,
        requestHeaders: this.requestHeaders,
        request: this.request,
        headers,
        status,
        trailers
      };
    });
  }
};

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/client-streaming-call.js
var __awaiter3 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var ClientStreamingCall = class {
  constructor(method, requestHeaders, request, headers, response, status, trailers) {
    this.method = method;
    this.requestHeaders = requestHeaders;
    this.requests = request;
    this.headers = headers;
    this.response = response;
    this.status = status;
    this.trailers = trailers;
  }
  /**
   * Instead of awaiting the response status and trailers, you can
   * just as well await this call itself to receive the server outcome.
   * Note that it may still be valid to send more request messages.
   */
  then(onfulfilled, onrejected) {
    return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
  }
  promiseFinished() {
    return __awaiter3(this, void 0, void 0, function* () {
      let [headers, response, status, trailers] = yield Promise.all([this.headers, this.response, this.status, this.trailers]);
      return {
        method: this.method,
        requestHeaders: this.requestHeaders,
        headers,
        response,
        status,
        trailers
      };
    });
  }
};

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/duplex-streaming-call.js
var __awaiter4 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var DuplexStreamingCall = class {
  constructor(method, requestHeaders, request, headers, response, status, trailers) {
    this.method = method;
    this.requestHeaders = requestHeaders;
    this.requests = request;
    this.headers = headers;
    this.responses = response;
    this.status = status;
    this.trailers = trailers;
  }
  /**
   * Instead of awaiting the response status and trailers, you can
   * just as well await this call itself to receive the server outcome.
   * Note that it may still be valid to send more request messages.
   */
  then(onfulfilled, onrejected) {
    return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
  }
  promiseFinished() {
    return __awaiter4(this, void 0, void 0, function* () {
      let [headers, status, trailers] = yield Promise.all([this.headers, this.status, this.trailers]);
      return {
        method: this.method,
        requestHeaders: this.requestHeaders,
        headers,
        status,
        trailers
      };
    });
  }
};

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/test-transport.js
var __awaiter5 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var TestTransport = class _TestTransport {
  /**
   * Initialize with mock data. Omitted fields have default value.
   */
  constructor(data) {
    this.suppressUncaughtRejections = true;
    this.headerDelay = 10;
    this.responseDelay = 50;
    this.betweenResponseDelay = 10;
    this.afterResponseDelay = 10;
    this.data = data !== null && data !== void 0 ? data : {};
  }
  /**
   * Sent message(s) during the last operation.
   */
  get sentMessages() {
    if (this.lastInput instanceof TestInputStream) {
      return this.lastInput.sent;
    } else if (typeof this.lastInput == "object") {
      return [this.lastInput.single];
    }
    return [];
  }
  /**
   * Sending message(s) completed?
   */
  get sendComplete() {
    if (this.lastInput instanceof TestInputStream) {
      return this.lastInput.completed;
    } else if (typeof this.lastInput == "object") {
      return true;
    }
    return false;
  }
  // Creates a promise for response headers from the mock data.
  promiseHeaders() {
    var _a;
    const headers = (_a = this.data.headers) !== null && _a !== void 0 ? _a : _TestTransport.defaultHeaders;
    return headers instanceof RpcError ? Promise.reject(headers) : Promise.resolve(headers);
  }
  // Creates a promise for a single, valid, message from the mock data.
  promiseSingleResponse(method) {
    if (this.data.response instanceof RpcError) {
      return Promise.reject(this.data.response);
    }
    let r;
    if (Array.isArray(this.data.response)) {
      assert(this.data.response.length > 0);
      r = this.data.response[0];
    } else if (this.data.response !== void 0) {
      r = this.data.response;
    } else {
      r = method.O.create();
    }
    assert(method.O.is(r));
    return Promise.resolve(r);
  }
  /**
   * Pushes response messages from the mock data to the output stream.
   * If an error response, status or trailers are mocked, the stream is
   * closed with the respective error.
   * Otherwise, stream is completed successfully.
   *
   * The returned promise resolves when the stream is closed. It should
   * not reject. If it does, code is broken.
   */
  streamResponses(method, stream, abort) {
    return __awaiter5(this, void 0, void 0, function* () {
      const messages = [];
      if (this.data.response === void 0) {
        messages.push(method.O.create());
      } else if (Array.isArray(this.data.response)) {
        for (let msg of this.data.response) {
          assert(method.O.is(msg));
          messages.push(msg);
        }
      } else if (!(this.data.response instanceof RpcError)) {
        assert(method.O.is(this.data.response));
        messages.push(this.data.response);
      }
      try {
        yield delay(this.responseDelay, abort)(void 0);
      } catch (error) {
        stream.notifyError(error);
        return;
      }
      if (this.data.response instanceof RpcError) {
        stream.notifyError(this.data.response);
        return;
      }
      for (let msg of messages) {
        stream.notifyMessage(msg);
        try {
          yield delay(this.betweenResponseDelay, abort)(void 0);
        } catch (error) {
          stream.notifyError(error);
          return;
        }
      }
      if (this.data.status instanceof RpcError) {
        stream.notifyError(this.data.status);
        return;
      }
      if (this.data.trailers instanceof RpcError) {
        stream.notifyError(this.data.trailers);
        return;
      }
      stream.notifyComplete();
    });
  }
  // Creates a promise for response status from the mock data.
  promiseStatus() {
    var _a;
    const status = (_a = this.data.status) !== null && _a !== void 0 ? _a : _TestTransport.defaultStatus;
    return status instanceof RpcError ? Promise.reject(status) : Promise.resolve(status);
  }
  // Creates a promise for response trailers from the mock data.
  promiseTrailers() {
    var _a;
    const trailers = (_a = this.data.trailers) !== null && _a !== void 0 ? _a : _TestTransport.defaultTrailers;
    return trailers instanceof RpcError ? Promise.reject(trailers) : Promise.resolve(trailers);
  }
  maybeSuppressUncaught(...promise) {
    if (this.suppressUncaughtRejections) {
      for (let p of promise) {
        p.catch(() => {
        });
      }
    }
  }
  mergeOptions(options) {
    return mergeRpcOptions({}, options);
  }
  unary(method, input, options) {
    var _a;
    const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), responsePromise = headersPromise.catch((_) => {
    }).then(delay(this.responseDelay, options.abort)).then((_) => this.promiseSingleResponse(method)), statusPromise = responsePromise.catch((_) => {
    }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseStatus()), trailersPromise = responsePromise.catch((_) => {
    }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseTrailers());
    this.maybeSuppressUncaught(statusPromise, trailersPromise);
    this.lastInput = {
      single: input
    };
    return new UnaryCall(method, requestHeaders, input, headersPromise, responsePromise, statusPromise, trailersPromise);
  }
  serverStreaming(method, input, options) {
    var _a;
    const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), outputStream = new RpcOutputStreamController(), responseStreamClosedPromise = headersPromise.then(delay(this.responseDelay, options.abort)).catch(() => {
    }).then(() => this.streamResponses(method, outputStream, options.abort)).then(delay(this.afterResponseDelay, options.abort)), statusPromise = responseStreamClosedPromise.then(() => this.promiseStatus()), trailersPromise = responseStreamClosedPromise.then(() => this.promiseTrailers());
    this.maybeSuppressUncaught(statusPromise, trailersPromise);
    this.lastInput = {
      single: input
    };
    return new ServerStreamingCall(method, requestHeaders, input, headersPromise, outputStream, statusPromise, trailersPromise);
  }
  clientStreaming(method, options) {
    var _a;
    const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), responsePromise = headersPromise.catch((_) => {
    }).then(delay(this.responseDelay, options.abort)).then((_) => this.promiseSingleResponse(method)), statusPromise = responsePromise.catch((_) => {
    }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseStatus()), trailersPromise = responsePromise.catch((_) => {
    }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseTrailers());
    this.maybeSuppressUncaught(statusPromise, trailersPromise);
    this.lastInput = new TestInputStream(this.data, options.abort);
    return new ClientStreamingCall(method, requestHeaders, this.lastInput, headersPromise, responsePromise, statusPromise, trailersPromise);
  }
  duplex(method, options) {
    var _a;
    const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), outputStream = new RpcOutputStreamController(), responseStreamClosedPromise = headersPromise.then(delay(this.responseDelay, options.abort)).catch(() => {
    }).then(() => this.streamResponses(method, outputStream, options.abort)).then(delay(this.afterResponseDelay, options.abort)), statusPromise = responseStreamClosedPromise.then(() => this.promiseStatus()), trailersPromise = responseStreamClosedPromise.then(() => this.promiseTrailers());
    this.maybeSuppressUncaught(statusPromise, trailersPromise);
    this.lastInput = new TestInputStream(this.data, options.abort);
    return new DuplexStreamingCall(method, requestHeaders, this.lastInput, headersPromise, outputStream, statusPromise, trailersPromise);
  }
};
TestTransport.defaultHeaders = {
  responseHeader: "test"
};
TestTransport.defaultStatus = {
  code: "OK",
  detail: "all good"
};
TestTransport.defaultTrailers = {
  responseTrailer: "test"
};
function delay(ms, abort) {
  return (v) => new Promise((resolve, reject) => {
    if (abort === null || abort === void 0 ? void 0 : abort.aborted) {
      reject(new RpcError("user cancel", "CANCELLED"));
    } else {
      const id = setTimeout(() => resolve(v), ms);
      if (abort) {
        abort.addEventListener("abort", (ev) => {
          clearTimeout(id);
          reject(new RpcError("user cancel", "CANCELLED"));
        });
      }
    }
  });
}
var TestInputStream = class {
  constructor(data, abort) {
    this._completed = false;
    this._sent = [];
    this.data = data;
    this.abort = abort;
  }
  get sent() {
    return this._sent;
  }
  get completed() {
    return this._completed;
  }
  send(message) {
    if (this.data.inputMessage instanceof RpcError) {
      return Promise.reject(this.data.inputMessage);
    }
    const delayMs = this.data.inputMessage === void 0 ? 10 : this.data.inputMessage;
    return Promise.resolve(void 0).then(() => {
      this._sent.push(message);
    }).then(delay(delayMs, this.abort));
  }
  complete() {
    if (this.data.inputComplete instanceof RpcError) {
      return Promise.reject(this.data.inputComplete);
    }
    const delayMs = this.data.inputComplete === void 0 ? 10 : this.data.inputComplete;
    return Promise.resolve(void 0).then(() => {
      this._completed = true;
    }).then(delay(delayMs, this.abort));
  }
};

// node_modules/@protobuf-ts/runtime-rpc/build/es2015/rpc-interceptor.js
function stackIntercept(kind, transport, method, options, input) {
  var _a, _b, _c, _d;
  if (kind == "unary") {
    let tail = (mtd, inp, opt) => transport.unary(mtd, inp, opt);
    for (const curr of ((_a = options.interceptors) !== null && _a !== void 0 ? _a : []).filter((i) => i.interceptUnary).reverse()) {
      const next = tail;
      tail = (mtd, inp, opt) => curr.interceptUnary(next, mtd, inp, opt);
    }
    return tail(method, input, options);
  }
  if (kind == "serverStreaming") {
    let tail = (mtd, inp, opt) => transport.serverStreaming(mtd, inp, opt);
    for (const curr of ((_b = options.interceptors) !== null && _b !== void 0 ? _b : []).filter((i) => i.interceptServerStreaming).reverse()) {
      const next = tail;
      tail = (mtd, inp, opt) => curr.interceptServerStreaming(next, mtd, inp, opt);
    }
    return tail(method, input, options);
  }
  if (kind == "clientStreaming") {
    let tail = (mtd, opt) => transport.clientStreaming(mtd, opt);
    for (const curr of ((_c = options.interceptors) !== null && _c !== void 0 ? _c : []).filter((i) => i.interceptClientStreaming).reverse()) {
      const next = tail;
      tail = (mtd, opt) => curr.interceptClientStreaming(next, mtd, opt);
    }
    return tail(method, options);
  }
  if (kind == "duplex") {
    let tail = (mtd, opt) => transport.duplex(mtd, opt);
    for (const curr of ((_d = options.interceptors) !== null && _d !== void 0 ? _d : []).filter((i) => i.interceptDuplex).reverse()) {
      const next = tail;
      tail = (mtd, opt) => curr.interceptDuplex(next, mtd, opt);
    }
    return tail(method, options);
  }
  assertNever(kind);
}

// node_modules/@protobuf-ts/twirp-transport/build/es2015/twitch-twirp-error-code.js
var TwirpErrorCode;
(function(TwirpErrorCode2) {
  TwirpErrorCode2[TwirpErrorCode2["cancelled"] = 0] = "cancelled";
  TwirpErrorCode2[TwirpErrorCode2["unknown"] = 1] = "unknown";
  TwirpErrorCode2[TwirpErrorCode2["invalid_argument"] = 2] = "invalid_argument";
  TwirpErrorCode2[TwirpErrorCode2["malformed"] = 3] = "malformed";
  TwirpErrorCode2[TwirpErrorCode2["deadline_exceeded"] = 4] = "deadline_exceeded";
  TwirpErrorCode2[TwirpErrorCode2["not_found"] = 5] = "not_found";
  TwirpErrorCode2[TwirpErrorCode2["bad_route"] = 6] = "bad_route";
  TwirpErrorCode2[TwirpErrorCode2["already_exists"] = 7] = "already_exists";
  TwirpErrorCode2[TwirpErrorCode2["permission_denied"] = 8] = "permission_denied";
  TwirpErrorCode2[TwirpErrorCode2["unauthenticated"] = 9] = "unauthenticated";
  TwirpErrorCode2[TwirpErrorCode2["resource_exhausted"] = 10] = "resource_exhausted";
  TwirpErrorCode2[TwirpErrorCode2["failed_precondition"] = 11] = "failed_precondition";
  TwirpErrorCode2[TwirpErrorCode2["aborted"] = 12] = "aborted";
  TwirpErrorCode2[TwirpErrorCode2["out_of_range"] = 13] = "out_of_range";
  TwirpErrorCode2[TwirpErrorCode2["unimplemented"] = 14] = "unimplemented";
  TwirpErrorCode2[TwirpErrorCode2["internal"] = 15] = "internal";
  TwirpErrorCode2[TwirpErrorCode2["unavailable"] = 16] = "unavailable";
  TwirpErrorCode2[TwirpErrorCode2["dataloss"] = 17] = "dataloss";
})(TwirpErrorCode || (TwirpErrorCode = {}));

// node_modules/@protobuf-ts/twirp-transport/build/es2015/twirp-format.js
function createTwirpRequestHeader(headers, sendJson, meta) {
  if (meta) {
    for (let [k, v] of Object.entries(meta)) {
      if (typeof v == "string") headers.append(k, v);
      else for (let i of v) headers.append(k, i);
    }
  }
  headers.set("Content-Type", sendJson ? "application/json" : "application/protobuf");
  headers.set("Accept", sendJson ? "application/json" : "application/protobuf, application/json");
  return headers;
}
function parseTwirpErrorResponse(json) {
  if (!isJsonObject(json) || typeof json.code !== "string" || typeof json.msg !== "string") return new RpcError("cannot read twirp error response", TwirpErrorCode[TwirpErrorCode.internal]);
  let meta = {};
  if (isJsonObject(json.meta)) {
    for (let [k, v] of Object.entries(json.meta)) {
      if (typeof v == "string") meta[k] = v;
    }
  }
  return new RpcError(json.msg, json.code, meta);
}
function parseMetadataFromResponseHeaders(headers) {
  let meta = {};
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "content-type") return;
    if (key.toLowerCase() === "content-length") return;
    if (meta.hasOwnProperty(key)) meta[key].push(value);
    else meta[key] = value;
  });
  return meta;
}

// node_modules/@protobuf-ts/twirp-transport/build/es2015/twirp-transport.js
var TwirpFetchTransport = class {
  constructor(options) {
    this.defaultOptions = options;
  }
  mergeOptions(options) {
    return mergeRpcOptions(this.defaultOptions, options);
  }
  unary(method, input, options) {
    var _a, _b, _c;
    let opt = options, url = this.makeUrl(method, opt), fetchInit = (_a = opt.fetchInit) !== null && _a !== void 0 ? _a : {}, requestBody = opt.sendJson ? method.I.toJsonString(input, opt.jsonOptions) : method.I.toBinary(input, opt.binaryOptions), defHeader = new Deferred(), defMessage = new Deferred(), defStatus = new Deferred(), defTrailer = new Deferred();
    globalThis.fetch(url, Object.assign(Object.assign({}, fetchInit), {
      method: "POST",
      headers: createTwirpRequestHeader(new globalThis.Headers(), !!opt.sendJson, opt.meta),
      body: requestBody,
      signal: (_b = options.abort) !== null && _b !== void 0 ? _b : null
      // node-fetch@3.0.0-beta.9 rejects `undefined`
    })).then((fetchResponse) => {
      defHeader.resolve(parseMetadataFromResponseHeaders(fetchResponse.headers));
      let responseType;
      try {
        responseType = fetchResponse.type;
      } catch (_a2) {
      }
      switch (responseType) {
        case "error":
        case "opaque":
        case "opaqueredirect":
          throw new RpcError(`fetch response type ${fetchResponse.type}`, TwirpErrorCode[TwirpErrorCode.unknown]);
      }
      if (!fetchResponse.ok) {
        return fetchResponse.json().then((value) => {
          throw parseTwirpErrorResponse(value);
        }, () => {
          throw new RpcError("received HTTP " + fetchResponse.status + ", unable to read response body as json", TwirpErrorCode[TwirpErrorCode.internal]);
        });
      }
      if (opt.sendJson) {
        return fetchResponse.json().then((value) => method.O.fromJson(value, opt.jsonOptions), () => {
          throw new RpcError("unable to read response body as json", TwirpErrorCode[TwirpErrorCode.dataloss]);
        });
      }
      return fetchResponse.arrayBuffer().then((value) => method.O.fromBinary(new Uint8Array(value), opt.binaryOptions), () => {
        throw new RpcError("unable to read response body", TwirpErrorCode[TwirpErrorCode.dataloss]);
      });
    }, (reason) => {
      if (reason instanceof Error && reason.name === "AbortError") throw new RpcError(reason.message, TwirpErrorCode[TwirpErrorCode.cancelled]);
      throw new RpcError(reason instanceof Error ? reason.message : reason);
    }).then((message) => {
      defMessage.resolve(message);
      defStatus.resolve({
        code: "OK",
        detail: ""
      });
      defTrailer.resolve({});
    }).catch((reason) => {
      let error = reason instanceof RpcError ? reason : new RpcError(reason instanceof Error ? reason.message : reason, TwirpErrorCode[TwirpErrorCode.internal]);
      error.methodName = method.name;
      error.serviceName = method.service.typeName;
      defHeader.rejectPending(error);
      defMessage.rejectPending(error);
      defStatus.rejectPending(error);
      defTrailer.rejectPending(error);
    });
    return new UnaryCall(method, (_c = opt.meta) !== null && _c !== void 0 ? _c : {}, input, defHeader.promise, defMessage.promise, defStatus.promise, defTrailer.promise);
  }
  /**
   * Create an URI for a RPC call.
   *
   * Takes the `baseUrl` option and appends:
   * - slash "/"
   * - package name
   * - dot "."
   * - service name
   * - slash "/"
   * - method name
   *
   * If the service was declared without a package, the package name and dot
   * are omitted.
   *
   * The method name is CamelCased just as it would be in Go, unless the
   * option `useProtoMethodName` is `true`.
   */
  makeUrl(method, options) {
    let base = options.baseUrl;
    if (base.endsWith("/")) base = base.substring(0, base.length - 1);
    let methodName = method.name;
    if (options.useProtoMethodName !== true) {
      methodName = lowerCamelCase(methodName);
      methodName = methodName.substring(0, 1).toUpperCase() + methodName.substring(1);
    }
    return `${base}/${method.service.typeName}/${methodName}`;
  }
  clientStreaming(method) {
    const e = new RpcError("Client streaming is not supported by Twirp", TwirpErrorCode[TwirpErrorCode.unimplemented]);
    e.methodName = method.name;
    e.serviceName = method.service.typeName;
    throw e;
  }
  duplex(method) {
    const e = new RpcError("Duplex streaming is not supported by Twirp", TwirpErrorCode[TwirpErrorCode.unimplemented]);
    e.methodName = method.name;
    e.serviceName = method.service.typeName;
    throw e;
  }
  serverStreaming(method) {
    const e = new RpcError("Server streaming is not supported by Twirp", TwirpErrorCode[TwirpErrorCode.unimplemented]);
    e.methodName = method.name;
    e.serviceName = method.service.typeName;
    throw e;
  }
};

// node_modules/@stream-io/video-client/dist/index.browser.es.js
var import_ua_parser_js = __toESM(require_ua_parser());
var import_sdp_transform = __toESM(require_lib());
var Tracer = class {
  constructor(id) {
    this.buffer = [];
    this.enabled = true;
    this.setEnabled = (enabled) => {
      if (this.enabled === enabled) return;
      this.enabled = enabled;
      this.buffer = [];
    };
    this.trace = (tag, data) => {
      if (!this.enabled) return;
      this.buffer.push([tag, this.id, data, Date.now()]);
    };
    this.take = () => {
      const snapshot = this.buffer;
      this.buffer = [];
      return {
        snapshot,
        rollback: () => {
          this.buffer.unshift(...snapshot);
        }
      };
    };
    this.dispose = () => {
      this.buffer = [];
    };
    this.id = id;
  }
};
var tracer = new Tracer(null);
if (typeof navigator !== "undefined" && typeof navigator.mediaDevices !== "undefined") {
  const dumpStream = (stream) => ({
    id: stream.id,
    tracks: stream.getTracks().map((track) => ({
      id: track.id,
      kind: track.kind,
      label: track.label,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState
    }))
  });
  const trace = tracer.trace;
  const target = navigator.mediaDevices;
  for (const method of ["getUserMedia", "getDisplayMedia"]) {
    const original = target[method];
    if (!original) continue;
    let mark = 0;
    target[method] = function tracedMethod(constraints) {
      return __async(this, null, function* () {
        const tag = `navigator.mediaDevices.${method}.${mark++}`;
        trace(tag, constraints);
        try {
          const stream = yield original.call(target, constraints);
          trace(`${tag}.OnSuccess`, dumpStream(stream));
          return stream;
        } catch (err) {
          trace(`${tag}.OnFailure`, err.name);
          throw err;
        }
      });
    };
  }
}
var AudioSettingsRequestDefaultDeviceEnum = {
  SPEAKER: "speaker",
  EARPIECE: "earpiece"
};
var AudioSettingsResponseDefaultDeviceEnum = {
  SPEAKER: "speaker",
  EARPIECE: "earpiece"
};
var CreateDeviceRequestPushProviderEnum = {
  FIREBASE: "firebase",
  APN: "apn",
  HUAWEI: "huawei",
  XIAOMI: "xiaomi"
};
var FrameRecordingSettingsRequestModeEnum = {
  AVAILABLE: "available",
  DISABLED: "disabled",
  AUTO_ON: "auto-on"
};
var FrameRecordingSettingsRequestQualityEnum = {
  _360P: "360p",
  _480P: "480p",
  _720P: "720p",
  _1080P: "1080p",
  _1440P: "1440p",
  _2160P: "2160p"
};
var FrameRecordingSettingsResponseModeEnum = {
  AVAILABLE: "available",
  DISABLED: "disabled",
  AUTO_ON: "auto-on"
};
var LayoutSettingsRequestNameEnum = {
  SPOTLIGHT: "spotlight",
  GRID: "grid",
  SINGLE_PARTICIPANT: "single-participant",
  MOBILE: "mobile",
  CUSTOM: "custom"
};
var NoiseCancellationSettingsModeEnum = {
  AVAILABLE: "available",
  DISABLED: "disabled",
  AUTO_ON: "auto-on"
};
var OwnCapability = {
  BLOCK_USERS: "block-users",
  CHANGE_MAX_DURATION: "change-max-duration",
  CREATE_CALL: "create-call",
  CREATE_REACTION: "create-reaction",
  ENABLE_NOISE_CANCELLATION: "enable-noise-cancellation",
  END_CALL: "end-call",
  JOIN_BACKSTAGE: "join-backstage",
  JOIN_CALL: "join-call",
  JOIN_ENDED_CALL: "join-ended-call",
  MUTE_USERS: "mute-users",
  PIN_FOR_EVERYONE: "pin-for-everyone",
  READ_CALL: "read-call",
  REMOVE_CALL_MEMBER: "remove-call-member",
  SCREENSHARE: "screenshare",
  SEND_AUDIO: "send-audio",
  SEND_VIDEO: "send-video",
  START_BROADCAST_CALL: "start-broadcast-call",
  START_CLOSED_CAPTIONS_CALL: "start-closed-captions-call",
  START_FRAME_RECORD_CALL: "start-frame-record-call",
  START_RECORD_CALL: "start-record-call",
  START_TRANSCRIPTION_CALL: "start-transcription-call",
  STOP_BROADCAST_CALL: "stop-broadcast-call",
  STOP_CLOSED_CAPTIONS_CALL: "stop-closed-captions-call",
  STOP_FRAME_RECORD_CALL: "stop-frame-record-call",
  STOP_RECORD_CALL: "stop-record-call",
  STOP_TRANSCRIPTION_CALL: "stop-transcription-call",
  UPDATE_CALL: "update-call",
  UPDATE_CALL_MEMBER: "update-call-member",
  UPDATE_CALL_PERMISSIONS: "update-call-permissions",
  UPDATE_CALL_SETTINGS: "update-call-settings"
};
var RTMPBroadcastRequestQualityEnum = {
  _360P: "360p",
  _480P: "480p",
  _720P: "720p",
  _1080P: "1080p",
  _1440P: "1440p",
  _2160P: "2160p",
  PORTRAIT_360X640: "portrait-360x640",
  PORTRAIT_480X854: "portrait-480x854",
  PORTRAIT_720X1280: "portrait-720x1280",
  PORTRAIT_1080X1920: "portrait-1080x1920",
  PORTRAIT_1440X2560: "portrait-1440x2560",
  PORTRAIT_2160X3840: "portrait-2160x3840"
};
var RTMPSettingsRequestQualityEnum = {
  _360P: "360p",
  _480P: "480p",
  _720P: "720p",
  _1080P: "1080p",
  _1440P: "1440p",
  _2160P: "2160p",
  PORTRAIT_360X640: "portrait-360x640",
  PORTRAIT_480X854: "portrait-480x854",
  PORTRAIT_720X1280: "portrait-720x1280",
  PORTRAIT_1080X1920: "portrait-1080x1920",
  PORTRAIT_1440X2560: "portrait-1440x2560",
  PORTRAIT_2160X3840: "portrait-2160x3840"
};
var RecordSettingsRequestModeEnum = {
  AVAILABLE: "available",
  DISABLED: "disabled",
  AUTO_ON: "auto-on"
};
var RecordSettingsRequestQualityEnum = {
  _360P: "360p",
  _480P: "480p",
  _720P: "720p",
  _1080P: "1080p",
  _1440P: "1440p",
  _2160P: "2160p",
  PORTRAIT_360X640: "portrait-360x640",
  PORTRAIT_480X854: "portrait-480x854",
  PORTRAIT_720X1280: "portrait-720x1280",
  PORTRAIT_1080X1920: "portrait-1080x1920",
  PORTRAIT_1440X2560: "portrait-1440x2560",
  PORTRAIT_2160X3840: "portrait-2160x3840"
};
var TranscriptionSettingsRequestClosedCaptionModeEnum = {
  AVAILABLE: "available",
  DISABLED: "disabled",
  AUTO_ON: "auto-on"
};
var TranscriptionSettingsRequestLanguageEnum = {
  AUTO: "auto",
  EN: "en",
  FR: "fr",
  ES: "es",
  DE: "de",
  IT: "it",
  NL: "nl",
  PT: "pt",
  PL: "pl",
  CA: "ca",
  CS: "cs",
  DA: "da",
  EL: "el",
  FI: "fi",
  ID: "id",
  JA: "ja",
  RU: "ru",
  SV: "sv",
  TA: "ta",
  TH: "th",
  TR: "tr",
  HU: "hu",
  RO: "ro",
  ZH: "zh",
  AR: "ar",
  TL: "tl",
  HE: "he",
  HI: "hi",
  HR: "hr",
  KO: "ko",
  MS: "ms",
  NO: "no",
  UK: "uk"
};
var TranscriptionSettingsRequestModeEnum = {
  AVAILABLE: "available",
  DISABLED: "disabled",
  AUTO_ON: "auto-on"
};
var TranscriptionSettingsResponseClosedCaptionModeEnum = {
  AVAILABLE: "available",
  DISABLED: "disabled",
  AUTO_ON: "auto-on"
};
var TranscriptionSettingsResponseLanguageEnum = {
  AUTO: "auto",
  EN: "en",
  FR: "fr",
  ES: "es",
  DE: "de",
  IT: "it",
  NL: "nl",
  PT: "pt",
  PL: "pl",
  CA: "ca",
  CS: "cs",
  DA: "da",
  EL: "el",
  FI: "fi",
  ID: "id",
  JA: "ja",
  RU: "ru",
  SV: "sv",
  TA: "ta",
  TH: "th",
  TR: "tr",
  HU: "hu",
  RO: "ro",
  ZH: "zh",
  AR: "ar",
  TL: "tl",
  HE: "he",
  HI: "hi",
  HR: "hr",
  KO: "ko",
  MS: "ms",
  NO: "no",
  UK: "uk"
};
var TranscriptionSettingsResponseModeEnum = {
  AVAILABLE: "available",
  DISABLED: "disabled",
  AUTO_ON: "auto-on"
};
var VideoSettingsRequestCameraFacingEnum = {
  FRONT: "front",
  BACK: "back",
  EXTERNAL: "external"
};
var VideoSettingsResponseCameraFacingEnum = {
  FRONT: "front",
  BACK: "back",
  EXTERNAL: "external"
};
var ErrorFromResponse = class extends Error {
};
var NullValue;
(function(NullValue2) {
  NullValue2[NullValue2["NULL_VALUE"] = 0] = "NULL_VALUE";
})(NullValue || (NullValue = {}));
var Struct$Type = class extends MessageType {
  constructor() {
    super("google.protobuf.Struct", [{
      no: 1,
      name: "fields",
      kind: "map",
      K: 9,
      V: {
        kind: "message",
        T: () => Value
      }
    }]);
  }
  /**
   * Encode `Struct` to JSON object.
   */
  internalJsonWrite(message, options) {
    let json = {};
    for (let [k, v] of Object.entries(message.fields)) {
      json[k] = Value.toJson(v);
    }
    return json;
  }
  /**
   * Decode `Struct` from JSON object.
   */
  internalJsonRead(json, options, target) {
    if (!isJsonObject(json)) throw new globalThis.Error("Unable to parse message " + this.typeName + " from JSON " + typeofJsonValue(json) + ".");
    if (!target) target = this.create();
    for (let [k, v] of globalThis.Object.entries(json)) {
      target.fields[k] = Value.fromJson(v);
    }
    return target;
  }
};
var Struct = new Struct$Type();
var Value$Type = class extends MessageType {
  constructor() {
    super("google.protobuf.Value", [{
      no: 1,
      name: "null_value",
      kind: "enum",
      oneof: "kind",
      T: () => ["google.protobuf.NullValue", NullValue]
    }, {
      no: 2,
      name: "number_value",
      kind: "scalar",
      oneof: "kind",
      T: 1
      /*ScalarType.DOUBLE*/
    }, {
      no: 3,
      name: "string_value",
      kind: "scalar",
      oneof: "kind",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 4,
      name: "bool_value",
      kind: "scalar",
      oneof: "kind",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 5,
      name: "struct_value",
      kind: "message",
      oneof: "kind",
      T: () => Struct
    }, {
      no: 6,
      name: "list_value",
      kind: "message",
      oneof: "kind",
      T: () => ListValue
    }]);
  }
  /**
   * Encode `Value` to JSON value.
   */
  internalJsonWrite(message, options) {
    if (message.kind.oneofKind === void 0) throw new globalThis.Error();
    switch (message.kind.oneofKind) {
      case void 0:
        throw new globalThis.Error();
      case "boolValue":
        return message.kind.boolValue;
      case "nullValue":
        return null;
      case "numberValue":
        let numberValue = message.kind.numberValue;
        if (typeof numberValue == "number" && !Number.isFinite(numberValue)) throw new globalThis.Error();
        return numberValue;
      case "stringValue":
        return message.kind.stringValue;
      case "listValue":
        let listValueField = this.fields.find((f) => f.no === 6);
        if (listValueField?.kind !== "message") throw new globalThis.Error();
        return listValueField.T().toJson(message.kind.listValue);
      case "structValue":
        let structValueField = this.fields.find((f) => f.no === 5);
        if (structValueField?.kind !== "message") throw new globalThis.Error();
        return structValueField.T().toJson(message.kind.structValue);
    }
  }
  /**
   * Decode `Value` from JSON value.
   */
  internalJsonRead(json, options, target) {
    if (!target) target = this.create();
    switch (typeof json) {
      case "number":
        target.kind = {
          oneofKind: "numberValue",
          numberValue: json
        };
        break;
      case "string":
        target.kind = {
          oneofKind: "stringValue",
          stringValue: json
        };
        break;
      case "boolean":
        target.kind = {
          oneofKind: "boolValue",
          boolValue: json
        };
        break;
      case "object":
        if (json === null) {
          target.kind = {
            oneofKind: "nullValue",
            nullValue: NullValue.NULL_VALUE
          };
        } else if (globalThis.Array.isArray(json)) {
          target.kind = {
            oneofKind: "listValue",
            listValue: ListValue.fromJson(json)
          };
        } else {
          target.kind = {
            oneofKind: "structValue",
            structValue: Struct.fromJson(json)
          };
        }
        break;
      default:
        throw new globalThis.Error("Unable to parse " + this.typeName + " from JSON " + typeofJsonValue(json));
    }
    return target;
  }
};
var Value = new Value$Type();
var ListValue$Type = class extends MessageType {
  constructor() {
    super("google.protobuf.ListValue", [{
      no: 1,
      name: "values",
      kind: "message",
      repeat: 1,
      T: () => Value
    }]);
  }
  /**
   * Encode `ListValue` to JSON array.
   */
  internalJsonWrite(message, options) {
    return message.values.map((v) => Value.toJson(v));
  }
  /**
   * Decode `ListValue` from JSON array.
   */
  internalJsonRead(json, options, target) {
    if (!globalThis.Array.isArray(json)) throw new globalThis.Error("Unable to parse " + this.typeName + " from JSON " + typeofJsonValue(json));
    if (!target) target = this.create();
    let values = json.map((v) => Value.fromJson(v));
    target.values.push(...values);
    return target;
  }
};
var ListValue = new ListValue$Type();
var Timestamp$Type = class extends MessageType {
  constructor() {
    super("google.protobuf.Timestamp", [{
      no: 1,
      name: "seconds",
      kind: "scalar",
      T: 3
      /*ScalarType.INT64*/
    }, {
      no: 2,
      name: "nanos",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }]);
  }
  /**
   * Creates a new `Timestamp` for the current time.
   */
  now() {
    const msg = this.create();
    const ms = Date.now();
    msg.seconds = PbLong.from(Math.floor(ms / 1e3)).toString();
    msg.nanos = ms % 1e3 * 1e6;
    return msg;
  }
  /**
   * Converts a `Timestamp` to a JavaScript Date.
   */
  toDate(message) {
    return new Date(PbLong.from(message.seconds).toNumber() * 1e3 + Math.ceil(message.nanos / 1e6));
  }
  /**
   * Converts a JavaScript Date to a `Timestamp`.
   */
  fromDate(date) {
    const msg = this.create();
    const ms = date.getTime();
    msg.seconds = PbLong.from(Math.floor(ms / 1e3)).toString();
    msg.nanos = (ms % 1e3 + (ms < 0 && ms % 1e3 !== 0 ? 1e3 : 0)) * 1e6;
    return msg;
  }
  /**
   * In JSON format, the `Timestamp` type is encoded as a string
   * in the RFC 3339 format.
   */
  internalJsonWrite(message, options) {
    let ms = PbLong.from(message.seconds).toNumber() * 1e3;
    if (ms < Date.parse("0001-01-01T00:00:00Z") || ms > Date.parse("9999-12-31T23:59:59Z")) throw new Error("Unable to encode Timestamp to JSON. Must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive.");
    if (message.nanos < 0) throw new Error("Unable to encode invalid Timestamp to JSON. Nanos must not be negative.");
    let z = "Z";
    if (message.nanos > 0) {
      let nanosStr = (message.nanos + 1e9).toString().substring(1);
      if (nanosStr.substring(3) === "000000") z = "." + nanosStr.substring(0, 3) + "Z";
      else if (nanosStr.substring(6) === "000") z = "." + nanosStr.substring(0, 6) + "Z";
      else z = "." + nanosStr + "Z";
    }
    return new Date(ms).toISOString().replace(".000Z", z);
  }
  /**
   * In JSON format, the `Timestamp` type is encoded as a string
   * in the RFC 3339 format.
   */
  internalJsonRead(json, options, target) {
    if (typeof json !== "string") throw new Error("Unable to parse Timestamp from JSON " + typeofJsonValue(json) + ".");
    let matches = json.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:Z|\.([0-9]{3,9})Z|([+-][0-9][0-9]:[0-9][0-9]))$/);
    if (!matches) throw new Error("Unable to parse Timestamp from JSON. Invalid format.");
    let ms = Date.parse(matches[1] + "-" + matches[2] + "-" + matches[3] + "T" + matches[4] + ":" + matches[5] + ":" + matches[6] + (matches[8] ? matches[8] : "Z"));
    if (Number.isNaN(ms)) throw new Error("Unable to parse Timestamp from JSON. Invalid value.");
    if (ms < Date.parse("0001-01-01T00:00:00Z") || ms > Date.parse("9999-12-31T23:59:59Z")) throw new globalThis.Error("Unable to parse Timestamp from JSON. Must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive.");
    if (!target) target = this.create();
    target.seconds = PbLong.from(ms / 1e3).toString();
    target.nanos = 0;
    if (matches[7]) target.nanos = parseInt("1" + matches[7] + "0".repeat(9 - matches[7].length)) - 1e9;
    return target;
  }
};
var Timestamp = new Timestamp$Type();
var PeerType;
(function(PeerType2) {
  PeerType2[PeerType2["PUBLISHER_UNSPECIFIED"] = 0] = "PUBLISHER_UNSPECIFIED";
  PeerType2[PeerType2["SUBSCRIBER"] = 1] = "SUBSCRIBER";
})(PeerType || (PeerType = {}));
var ConnectionQuality;
(function(ConnectionQuality2) {
  ConnectionQuality2[ConnectionQuality2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  ConnectionQuality2[ConnectionQuality2["POOR"] = 1] = "POOR";
  ConnectionQuality2[ConnectionQuality2["GOOD"] = 2] = "GOOD";
  ConnectionQuality2[ConnectionQuality2["EXCELLENT"] = 3] = "EXCELLENT";
})(ConnectionQuality || (ConnectionQuality = {}));
var VideoQuality;
(function(VideoQuality2) {
  VideoQuality2[VideoQuality2["LOW_UNSPECIFIED"] = 0] = "LOW_UNSPECIFIED";
  VideoQuality2[VideoQuality2["MID"] = 1] = "MID";
  VideoQuality2[VideoQuality2["HIGH"] = 2] = "HIGH";
  VideoQuality2[VideoQuality2["OFF"] = 3] = "OFF";
})(VideoQuality || (VideoQuality = {}));
var TrackType;
(function(TrackType2) {
  TrackType2[TrackType2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  TrackType2[TrackType2["AUDIO"] = 1] = "AUDIO";
  TrackType2[TrackType2["VIDEO"] = 2] = "VIDEO";
  TrackType2[TrackType2["SCREEN_SHARE"] = 3] = "SCREEN_SHARE";
  TrackType2[TrackType2["SCREEN_SHARE_AUDIO"] = 4] = "SCREEN_SHARE_AUDIO";
})(TrackType || (TrackType = {}));
var ErrorCode;
(function(ErrorCode2) {
  ErrorCode2[ErrorCode2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  ErrorCode2[ErrorCode2["PUBLISH_TRACK_NOT_FOUND"] = 100] = "PUBLISH_TRACK_NOT_FOUND";
  ErrorCode2[ErrorCode2["PUBLISH_TRACKS_MISMATCH"] = 101] = "PUBLISH_TRACKS_MISMATCH";
  ErrorCode2[ErrorCode2["PUBLISH_TRACK_OUT_OF_ORDER"] = 102] = "PUBLISH_TRACK_OUT_OF_ORDER";
  ErrorCode2[ErrorCode2["PUBLISH_TRACK_VIDEO_LAYER_NOT_FOUND"] = 103] = "PUBLISH_TRACK_VIDEO_LAYER_NOT_FOUND";
  ErrorCode2[ErrorCode2["LIVE_ENDED"] = 104] = "LIVE_ENDED";
  ErrorCode2[ErrorCode2["PARTICIPANT_NOT_FOUND"] = 200] = "PARTICIPANT_NOT_FOUND";
  ErrorCode2[ErrorCode2["PARTICIPANT_MIGRATING_OUT"] = 201] = "PARTICIPANT_MIGRATING_OUT";
  ErrorCode2[ErrorCode2["PARTICIPANT_MIGRATION_FAILED"] = 202] = "PARTICIPANT_MIGRATION_FAILED";
  ErrorCode2[ErrorCode2["PARTICIPANT_MIGRATING"] = 203] = "PARTICIPANT_MIGRATING";
  ErrorCode2[ErrorCode2["PARTICIPANT_RECONNECT_FAILED"] = 204] = "PARTICIPANT_RECONNECT_FAILED";
  ErrorCode2[ErrorCode2["PARTICIPANT_MEDIA_TRANSPORT_FAILURE"] = 205] = "PARTICIPANT_MEDIA_TRANSPORT_FAILURE";
  ErrorCode2[ErrorCode2["CALL_NOT_FOUND"] = 300] = "CALL_NOT_FOUND";
  ErrorCode2[ErrorCode2["REQUEST_VALIDATION_FAILED"] = 400] = "REQUEST_VALIDATION_FAILED";
  ErrorCode2[ErrorCode2["UNAUTHENTICATED"] = 401] = "UNAUTHENTICATED";
  ErrorCode2[ErrorCode2["PERMISSION_DENIED"] = 403] = "PERMISSION_DENIED";
  ErrorCode2[ErrorCode2["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
  ErrorCode2[ErrorCode2["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
  ErrorCode2[ErrorCode2["SFU_SHUTTING_DOWN"] = 600] = "SFU_SHUTTING_DOWN";
  ErrorCode2[ErrorCode2["SFU_FULL"] = 700] = "SFU_FULL";
})(ErrorCode || (ErrorCode = {}));
var SdkType;
(function(SdkType2) {
  SdkType2[SdkType2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  SdkType2[SdkType2["REACT"] = 1] = "REACT";
  SdkType2[SdkType2["ANGULAR"] = 2] = "ANGULAR";
  SdkType2[SdkType2["ANDROID"] = 3] = "ANDROID";
  SdkType2[SdkType2["IOS"] = 4] = "IOS";
  SdkType2[SdkType2["FLUTTER"] = 5] = "FLUTTER";
  SdkType2[SdkType2["REACT_NATIVE"] = 6] = "REACT_NATIVE";
  SdkType2[SdkType2["UNITY"] = 7] = "UNITY";
  SdkType2[SdkType2["GO"] = 8] = "GO";
  SdkType2[SdkType2["PLAIN_JAVASCRIPT"] = 9] = "PLAIN_JAVASCRIPT";
})(SdkType || (SdkType = {}));
var TrackUnpublishReason;
(function(TrackUnpublishReason2) {
  TrackUnpublishReason2[TrackUnpublishReason2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  TrackUnpublishReason2[TrackUnpublishReason2["USER_MUTED"] = 1] = "USER_MUTED";
  TrackUnpublishReason2[TrackUnpublishReason2["PERMISSION_REVOKED"] = 2] = "PERMISSION_REVOKED";
  TrackUnpublishReason2[TrackUnpublishReason2["MODERATION"] = 3] = "MODERATION";
})(TrackUnpublishReason || (TrackUnpublishReason = {}));
var GoAwayReason;
(function(GoAwayReason2) {
  GoAwayReason2[GoAwayReason2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  GoAwayReason2[GoAwayReason2["SHUTTING_DOWN"] = 1] = "SHUTTING_DOWN";
  GoAwayReason2[GoAwayReason2["REBALANCE"] = 2] = "REBALANCE";
})(GoAwayReason || (GoAwayReason = {}));
var CallEndedReason;
(function(CallEndedReason2) {
  CallEndedReason2[CallEndedReason2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  CallEndedReason2[CallEndedReason2["ENDED"] = 1] = "ENDED";
  CallEndedReason2[CallEndedReason2["LIVE_ENDED"] = 2] = "LIVE_ENDED";
  CallEndedReason2[CallEndedReason2["KICKED"] = 3] = "KICKED";
  CallEndedReason2[CallEndedReason2["SESSION_ENDED"] = 4] = "SESSION_ENDED";
})(CallEndedReason || (CallEndedReason = {}));
var WebsocketReconnectStrategy;
(function(WebsocketReconnectStrategy2) {
  WebsocketReconnectStrategy2[WebsocketReconnectStrategy2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  WebsocketReconnectStrategy2[WebsocketReconnectStrategy2["DISCONNECT"] = 1] = "DISCONNECT";
  WebsocketReconnectStrategy2[WebsocketReconnectStrategy2["FAST"] = 2] = "FAST";
  WebsocketReconnectStrategy2[WebsocketReconnectStrategy2["REJOIN"] = 3] = "REJOIN";
  WebsocketReconnectStrategy2[WebsocketReconnectStrategy2["MIGRATE"] = 4] = "MIGRATE";
})(WebsocketReconnectStrategy || (WebsocketReconnectStrategy = {}));
var AndroidThermalState;
(function(AndroidThermalState2) {
  AndroidThermalState2[AndroidThermalState2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  AndroidThermalState2[AndroidThermalState2["NONE"] = 1] = "NONE";
  AndroidThermalState2[AndroidThermalState2["LIGHT"] = 2] = "LIGHT";
  AndroidThermalState2[AndroidThermalState2["MODERATE"] = 3] = "MODERATE";
  AndroidThermalState2[AndroidThermalState2["SEVERE"] = 4] = "SEVERE";
  AndroidThermalState2[AndroidThermalState2["CRITICAL"] = 5] = "CRITICAL";
  AndroidThermalState2[AndroidThermalState2["EMERGENCY"] = 6] = "EMERGENCY";
  AndroidThermalState2[AndroidThermalState2["SHUTDOWN"] = 7] = "SHUTDOWN";
})(AndroidThermalState || (AndroidThermalState = {}));
var AppleThermalState;
(function(AppleThermalState2) {
  AppleThermalState2[AppleThermalState2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  AppleThermalState2[AppleThermalState2["NOMINAL"] = 1] = "NOMINAL";
  AppleThermalState2[AppleThermalState2["FAIR"] = 2] = "FAIR";
  AppleThermalState2[AppleThermalState2["SERIOUS"] = 3] = "SERIOUS";
  AppleThermalState2[AppleThermalState2["CRITICAL"] = 4] = "CRITICAL";
})(AppleThermalState || (AppleThermalState = {}));
var CallState$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.CallState", [{
      no: 1,
      name: "participants",
      kind: "message",
      repeat: 1,
      T: () => Participant
    }, {
      no: 2,
      name: "started_at",
      kind: "message",
      T: () => Timestamp
    }, {
      no: 3,
      name: "participant_count",
      kind: "message",
      T: () => ParticipantCount
    }, {
      no: 4,
      name: "pins",
      kind: "message",
      repeat: 1,
      T: () => Pin
    }]);
  }
};
var CallState$1 = new CallState$Type();
var ParticipantCount$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.ParticipantCount", [{
      no: 1,
      name: "total",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }, {
      no: 2,
      name: "anonymous",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }]);
  }
};
var ParticipantCount = new ParticipantCount$Type();
var Pin$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.Pin", [{
      no: 1,
      name: "user_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var Pin = new Pin$Type();
var Participant$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.Participant", [{
      no: 1,
      name: "user_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "published_tracks",
      kind: "enum",
      repeat: 1,
      T: () => ["stream.video.sfu.models.TrackType", TrackType, "TRACK_TYPE_"]
    }, {
      no: 4,
      name: "joined_at",
      kind: "message",
      T: () => Timestamp
    }, {
      no: 5,
      name: "track_lookup_prefix",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 6,
      name: "connection_quality",
      kind: "enum",
      T: () => ["stream.video.sfu.models.ConnectionQuality", ConnectionQuality, "CONNECTION_QUALITY_"]
    }, {
      no: 7,
      name: "is_speaking",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 8,
      name: "is_dominant_speaker",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 9,
      name: "audio_level",
      kind: "scalar",
      T: 2
      /*ScalarType.FLOAT*/
    }, {
      no: 10,
      name: "name",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 11,
      name: "image",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 12,
      name: "custom",
      kind: "message",
      T: () => Struct
    }, {
      no: 13,
      name: "roles",
      kind: "scalar",
      repeat: 2,
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var Participant = new Participant$Type();
var StreamQuality$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.StreamQuality", [{
      no: 1,
      name: "video_quality",
      kind: "enum",
      T: () => ["stream.video.sfu.models.VideoQuality", VideoQuality, "VIDEO_QUALITY_"]
    }, {
      no: 2,
      name: "user_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var StreamQuality = new StreamQuality$Type();
var VideoDimension$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.VideoDimension", [{
      no: 1,
      name: "width",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }, {
      no: 2,
      name: "height",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }]);
  }
};
var VideoDimension = new VideoDimension$Type();
var VideoLayer$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.VideoLayer", [{
      no: 1,
      name: "rid",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "video_dimension",
      kind: "message",
      T: () => VideoDimension
    }, {
      no: 4,
      name: "bitrate",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }, {
      no: 5,
      name: "fps",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }, {
      no: 6,
      name: "quality",
      kind: "enum",
      T: () => ["stream.video.sfu.models.VideoQuality", VideoQuality, "VIDEO_QUALITY_"]
    }]);
  }
};
var VideoLayer = new VideoLayer$Type();
var SubscribeOption$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.SubscribeOption", [{
      no: 1,
      name: "track_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.TrackType", TrackType, "TRACK_TYPE_"]
    }, {
      no: 2,
      name: "codecs",
      kind: "message",
      repeat: 1,
      T: () => Codec
    }]);
  }
};
var SubscribeOption = new SubscribeOption$Type();
var PublishOption$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.PublishOption", [{
      no: 1,
      name: "track_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.TrackType", TrackType, "TRACK_TYPE_"]
    }, {
      no: 2,
      name: "codec",
      kind: "message",
      T: () => Codec
    }, {
      no: 3,
      name: "bitrate",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }, {
      no: 4,
      name: "fps",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }, {
      no: 5,
      name: "max_spatial_layers",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }, {
      no: 6,
      name: "max_temporal_layers",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }, {
      no: 7,
      name: "video_dimension",
      kind: "message",
      T: () => VideoDimension
    }, {
      no: 8,
      name: "id",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }]);
  }
};
var PublishOption = new PublishOption$Type();
var Codec$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.Codec", [{
      no: 16,
      name: "payload_type",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }, {
      no: 10,
      name: "name",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 14,
      name: "clock_rate",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }, {
      no: 15,
      name: "encoding_parameters",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 12,
      name: "fmtp",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var Codec = new Codec$Type();
var ICETrickle$Type$1 = class ICETrickle$Type extends MessageType {
  constructor() {
    super("stream.video.sfu.models.ICETrickle", [{
      no: 1,
      name: "peer_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.PeerType", PeerType, "PEER_TYPE_"]
    }, {
      no: 2,
      name: "ice_candidate",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var ICETrickle$1 = new ICETrickle$Type$1();
var TrackInfo$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.TrackInfo", [{
      no: 1,
      name: "track_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "track_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.TrackType", TrackType, "TRACK_TYPE_"]
    }, {
      no: 5,
      name: "layers",
      kind: "message",
      repeat: 1,
      T: () => VideoLayer
    }, {
      no: 6,
      name: "mid",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 7,
      name: "dtx",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 8,
      name: "stereo",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 9,
      name: "red",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 10,
      name: "muted",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 11,
      name: "codec",
      kind: "message",
      T: () => Codec
    }, {
      no: 12,
      name: "publish_option_id",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }]);
  }
};
var TrackInfo = new TrackInfo$Type();
var Error$Type$1 = class Error$Type extends MessageType {
  constructor() {
    super("stream.video.sfu.models.Error", [{
      no: 1,
      name: "code",
      kind: "enum",
      T: () => ["stream.video.sfu.models.ErrorCode", ErrorCode, "ERROR_CODE_"]
    }, {
      no: 2,
      name: "message",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "should_retry",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }]);
  }
};
var Error$2 = new Error$Type$1();
var ClientDetails$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.ClientDetails", [{
      no: 1,
      name: "sdk",
      kind: "message",
      T: () => Sdk
    }, {
      no: 2,
      name: "os",
      kind: "message",
      T: () => OS
    }, {
      no: 3,
      name: "browser",
      kind: "message",
      T: () => Browser
    }, {
      no: 4,
      name: "device",
      kind: "message",
      T: () => Device
    }]);
  }
};
var ClientDetails = new ClientDetails$Type();
var Sdk$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.Sdk", [{
      no: 1,
      name: "type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.SdkType", SdkType, "SDK_TYPE_"]
    }, {
      no: 2,
      name: "major",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "minor",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 4,
      name: "patch",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var Sdk = new Sdk$Type();
var OS$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.OS", [{
      no: 1,
      name: "name",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "version",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "architecture",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var OS = new OS$Type();
var Browser$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.Browser", [{
      no: 1,
      name: "name",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "version",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var Browser = new Browser$Type();
var RTMPIngress$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.RTMPIngress", [{
      no: 1,
      name: "width",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }, {
      no: 2,
      name: "height",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }, {
      no: 3,
      name: "frame_rate",
      kind: "scalar",
      T: 1
      /*ScalarType.DOUBLE*/
    }, {
      no: 4,
      name: "software",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 5,
      name: "version",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 6,
      name: "encoder",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 7,
      name: "remote_addr",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var RTMPIngress = new RTMPIngress$Type();
var Device$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.Device", [{
      no: 1,
      name: "name",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "version",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var Device = new Device$Type();
var Call$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.Call", [{
      no: 1,
      name: "type",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "created_by_user_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 4,
      name: "host_user_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 5,
      name: "custom",
      kind: "message",
      T: () => Struct
    }, {
      no: 6,
      name: "created_at",
      kind: "message",
      T: () => Timestamp
    }, {
      no: 7,
      name: "updated_at",
      kind: "message",
      T: () => Timestamp
    }]);
  }
};
var Call$1 = new Call$Type();
var CallGrants$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.CallGrants", [{
      no: 1,
      name: "can_publish_audio",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 2,
      name: "can_publish_video",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 3,
      name: "can_screenshare",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }]);
  }
};
var CallGrants = new CallGrants$Type();
var InputDevices$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.InputDevices", [{
      no: 1,
      name: "available_devices",
      kind: "scalar",
      repeat: 2,
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "current_device",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "is_permitted",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }]);
  }
};
var InputDevices = new InputDevices$Type();
var AndroidState$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.AndroidState", [{
      no: 1,
      name: "thermal_state",
      kind: "enum",
      T: () => ["stream.video.sfu.models.AndroidThermalState", AndroidThermalState, "ANDROID_THERMAL_STATE_"]
    }, {
      no: 2,
      name: "is_power_saver_mode",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }]);
  }
};
var AndroidState = new AndroidState$Type();
var AppleState$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.AppleState", [{
      no: 1,
      name: "thermal_state",
      kind: "enum",
      T: () => ["stream.video.sfu.models.AppleThermalState", AppleThermalState, "APPLE_THERMAL_STATE_"]
    }, {
      no: 2,
      name: "is_low_power_mode_enabled",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }]);
  }
};
var AppleState = new AppleState$Type();
var PerformanceStats$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.models.PerformanceStats", [{
      no: 1,
      name: "track_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.TrackType", TrackType, "TRACK_TYPE_"]
    }, {
      no: 2,
      name: "codec",
      kind: "message",
      T: () => Codec
    }, {
      no: 3,
      name: "avg_frame_time_ms",
      kind: "scalar",
      T: 2
      /*ScalarType.FLOAT*/
    }, {
      no: 4,
      name: "avg_fps",
      kind: "scalar",
      T: 2
      /*ScalarType.FLOAT*/
    }, {
      no: 5,
      name: "video_dimension",
      kind: "message",
      T: () => VideoDimension
    }, {
      no: 6,
      name: "target_bitrate",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }]);
  }
};
var PerformanceStats = new PerformanceStats$Type();
var models = Object.freeze({
  __proto__: null,
  AndroidState,
  get AndroidThermalState() {
    return AndroidThermalState;
  },
  AppleState,
  get AppleThermalState() {
    return AppleThermalState;
  },
  Browser,
  Call: Call$1,
  get CallEndedReason() {
    return CallEndedReason;
  },
  CallGrants,
  CallState: CallState$1,
  ClientDetails,
  Codec,
  get ConnectionQuality() {
    return ConnectionQuality;
  },
  Device,
  Error: Error$2,
  get ErrorCode() {
    return ErrorCode;
  },
  get GoAwayReason() {
    return GoAwayReason;
  },
  ICETrickle: ICETrickle$1,
  InputDevices,
  OS,
  Participant,
  ParticipantCount,
  get PeerType() {
    return PeerType;
  },
  PerformanceStats,
  Pin,
  PublishOption,
  RTMPIngress,
  Sdk,
  get SdkType() {
    return SdkType;
  },
  StreamQuality,
  SubscribeOption,
  TrackInfo,
  get TrackType() {
    return TrackType;
  },
  get TrackUnpublishReason() {
    return TrackUnpublishReason;
  },
  VideoDimension,
  VideoLayer,
  get VideoQuality() {
    return VideoQuality;
  },
  get WebsocketReconnectStrategy() {
    return WebsocketReconnectStrategy;
  }
});
var StartNoiseCancellationRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.StartNoiseCancellationRequest", [{
      no: 1,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var StartNoiseCancellationRequest = new StartNoiseCancellationRequest$Type();
var StartNoiseCancellationResponse$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.StartNoiseCancellationResponse", [{
      no: 1,
      name: "error",
      kind: "message",
      T: () => Error$2
    }]);
  }
};
var StartNoiseCancellationResponse = new StartNoiseCancellationResponse$Type();
var StopNoiseCancellationRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.StopNoiseCancellationRequest", [{
      no: 1,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var StopNoiseCancellationRequest = new StopNoiseCancellationRequest$Type();
var StopNoiseCancellationResponse$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.StopNoiseCancellationResponse", [{
      no: 1,
      name: "error",
      kind: "message",
      T: () => Error$2
    }]);
  }
};
var StopNoiseCancellationResponse = new StopNoiseCancellationResponse$Type();
var Reconnection$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.Reconnection", [{
      no: 1,
      name: "time_seconds",
      kind: "scalar",
      T: 2
      /*ScalarType.FLOAT*/
    }, {
      no: 2,
      name: "strategy",
      kind: "enum",
      T: () => ["stream.video.sfu.models.WebsocketReconnectStrategy", WebsocketReconnectStrategy, "WEBSOCKET_RECONNECT_STRATEGY_"]
    }]);
  }
};
var Reconnection = new Reconnection$Type();
var Telemetry$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.Telemetry", [{
      no: 1,
      name: "connection_time_seconds",
      kind: "scalar",
      oneof: "data",
      T: 2
      /*ScalarType.FLOAT*/
    }, {
      no: 2,
      name: "reconnection",
      kind: "message",
      oneof: "data",
      T: () => Reconnection
    }]);
  }
};
var Telemetry = new Telemetry$Type();
var SendStatsRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.SendStatsRequest", [{
      no: 1,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "subscriber_stats",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "publisher_stats",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 4,
      name: "webrtc_version",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 5,
      name: "sdk",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 6,
      name: "sdk_version",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 7,
      name: "audio_devices",
      kind: "message",
      T: () => InputDevices
    }, {
      no: 8,
      name: "video_devices",
      kind: "message",
      T: () => InputDevices
    }, {
      no: 9,
      name: "android",
      kind: "message",
      oneof: "deviceState",
      T: () => AndroidState
    }, {
      no: 10,
      name: "apple",
      kind: "message",
      oneof: "deviceState",
      T: () => AppleState
    }, {
      no: 11,
      name: "telemetry",
      kind: "message",
      T: () => Telemetry
    }, {
      no: 12,
      name: "rtmp",
      kind: "message",
      T: () => RTMPIngress
    }, {
      no: 13,
      name: "subscriber_rtc_stats",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 14,
      name: "publisher_rtc_stats",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 15,
      name: "rtc_stats",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 16,
      name: "encode_stats",
      kind: "message",
      repeat: 1,
      T: () => PerformanceStats
    }, {
      no: 17,
      name: "decode_stats",
      kind: "message",
      repeat: 1,
      T: () => PerformanceStats
    }, {
      no: 18,
      name: "unified_session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var SendStatsRequest = new SendStatsRequest$Type();
var SendStatsResponse$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.SendStatsResponse", [{
      no: 1,
      name: "error",
      kind: "message",
      T: () => Error$2
    }]);
  }
};
var SendStatsResponse = new SendStatsResponse$Type();
var ICERestartRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.ICERestartRequest", [{
      no: 1,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "peer_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.PeerType", PeerType, "PEER_TYPE_"]
    }]);
  }
};
var ICERestartRequest = new ICERestartRequest$Type();
var ICERestartResponse$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.ICERestartResponse", [{
      no: 1,
      name: "error",
      kind: "message",
      T: () => Error$2
    }]);
  }
};
var ICERestartResponse = new ICERestartResponse$Type();
var UpdateMuteStatesRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.UpdateMuteStatesRequest", [{
      no: 1,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "mute_states",
      kind: "message",
      repeat: 1,
      T: () => TrackMuteState
    }]);
  }
};
var UpdateMuteStatesRequest = new UpdateMuteStatesRequest$Type();
var UpdateMuteStatesResponse$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.UpdateMuteStatesResponse", [{
      no: 4,
      name: "error",
      kind: "message",
      T: () => Error$2
    }]);
  }
};
var UpdateMuteStatesResponse = new UpdateMuteStatesResponse$Type();
var TrackMuteState$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.TrackMuteState", [{
      no: 1,
      name: "track_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.TrackType", TrackType, "TRACK_TYPE_"]
    }, {
      no: 2,
      name: "muted",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }]);
  }
};
var TrackMuteState = new TrackMuteState$Type();
var AudioMuteChanged$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.AudioMuteChanged", [{
      no: 1,
      name: "muted",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }]);
  }
};
new AudioMuteChanged$Type();
var VideoMuteChanged$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.VideoMuteChanged", [{
      no: 2,
      name: "muted",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }]);
  }
};
new VideoMuteChanged$Type();
var UpdateSubscriptionsRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.UpdateSubscriptionsRequest", [{
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "tracks",
      kind: "message",
      repeat: 1,
      T: () => TrackSubscriptionDetails
    }]);
  }
};
var UpdateSubscriptionsRequest = new UpdateSubscriptionsRequest$Type();
var UpdateSubscriptionsResponse$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.UpdateSubscriptionsResponse", [{
      no: 4,
      name: "error",
      kind: "message",
      T: () => Error$2
    }]);
  }
};
var UpdateSubscriptionsResponse = new UpdateSubscriptionsResponse$Type();
var TrackSubscriptionDetails$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.TrackSubscriptionDetails", [{
      no: 1,
      name: "user_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "track_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.TrackType", TrackType, "TRACK_TYPE_"]
    }, {
      no: 4,
      name: "dimension",
      kind: "message",
      T: () => VideoDimension
    }]);
  }
};
var TrackSubscriptionDetails = new TrackSubscriptionDetails$Type();
var SendAnswerRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.SendAnswerRequest", [{
      no: 1,
      name: "peer_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.PeerType", PeerType, "PEER_TYPE_"]
    }, {
      no: 2,
      name: "sdp",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var SendAnswerRequest = new SendAnswerRequest$Type();
var SendAnswerResponse$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.SendAnswerResponse", [{
      no: 4,
      name: "error",
      kind: "message",
      T: () => Error$2
    }]);
  }
};
var SendAnswerResponse = new SendAnswerResponse$Type();
var ICETrickleResponse$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.ICETrickleResponse", [{
      no: 4,
      name: "error",
      kind: "message",
      T: () => Error$2
    }]);
  }
};
var ICETrickleResponse = new ICETrickleResponse$Type();
var SetPublisherRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.SetPublisherRequest", [{
      no: 1,
      name: "sdp",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "tracks",
      kind: "message",
      repeat: 1,
      T: () => TrackInfo
    }]);
  }
};
var SetPublisherRequest = new SetPublisherRequest$Type();
var SetPublisherResponse$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.signal.SetPublisherResponse", [{
      no: 1,
      name: "sdp",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "ice_restart",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 4,
      name: "error",
      kind: "message",
      T: () => Error$2
    }]);
  }
};
var SetPublisherResponse = new SetPublisherResponse$Type();
var SignalServer = new ServiceType("stream.video.sfu.signal.SignalServer", [{
  name: "SetPublisher",
  options: {},
  I: SetPublisherRequest,
  O: SetPublisherResponse
}, {
  name: "SendAnswer",
  options: {},
  I: SendAnswerRequest,
  O: SendAnswerResponse
}, {
  name: "IceTrickle",
  options: {},
  I: ICETrickle$1,
  O: ICETrickleResponse
}, {
  name: "UpdateSubscriptions",
  options: {},
  I: UpdateSubscriptionsRequest,
  O: UpdateSubscriptionsResponse
}, {
  name: "UpdateMuteStates",
  options: {},
  I: UpdateMuteStatesRequest,
  O: UpdateMuteStatesResponse
}, {
  name: "IceRestart",
  options: {},
  I: ICERestartRequest,
  O: ICERestartResponse
}, {
  name: "SendStats",
  options: {},
  I: SendStatsRequest,
  O: SendStatsResponse
}, {
  name: "StartNoiseCancellation",
  options: {},
  I: StartNoiseCancellationRequest,
  O: StartNoiseCancellationResponse
}, {
  name: "StopNoiseCancellation",
  options: {},
  I: StopNoiseCancellationRequest,
  O: StopNoiseCancellationResponse
}]);
var SfuEvent$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.SfuEvent", [{
      no: 1,
      name: "subscriber_offer",
      kind: "message",
      oneof: "eventPayload",
      T: () => SubscriberOffer
    }, {
      no: 2,
      name: "publisher_answer",
      kind: "message",
      oneof: "eventPayload",
      T: () => PublisherAnswer
    }, {
      no: 3,
      name: "connection_quality_changed",
      kind: "message",
      oneof: "eventPayload",
      T: () => ConnectionQualityChanged
    }, {
      no: 4,
      name: "audio_level_changed",
      kind: "message",
      oneof: "eventPayload",
      T: () => AudioLevelChanged
    }, {
      no: 5,
      name: "ice_trickle",
      kind: "message",
      oneof: "eventPayload",
      T: () => ICETrickle$1
    }, {
      no: 6,
      name: "change_publish_quality",
      kind: "message",
      oneof: "eventPayload",
      T: () => ChangePublishQuality
    }, {
      no: 10,
      name: "participant_joined",
      kind: "message",
      oneof: "eventPayload",
      T: () => ParticipantJoined
    }, {
      no: 11,
      name: "participant_left",
      kind: "message",
      oneof: "eventPayload",
      T: () => ParticipantLeft
    }, {
      no: 12,
      name: "dominant_speaker_changed",
      kind: "message",
      oneof: "eventPayload",
      T: () => DominantSpeakerChanged
    }, {
      no: 13,
      name: "join_response",
      kind: "message",
      oneof: "eventPayload",
      T: () => JoinResponse
    }, {
      no: 14,
      name: "health_check_response",
      kind: "message",
      oneof: "eventPayload",
      T: () => HealthCheckResponse
    }, {
      no: 16,
      name: "track_published",
      kind: "message",
      oneof: "eventPayload",
      T: () => TrackPublished
    }, {
      no: 17,
      name: "track_unpublished",
      kind: "message",
      oneof: "eventPayload",
      T: () => TrackUnpublished
    }, {
      no: 18,
      name: "error",
      kind: "message",
      oneof: "eventPayload",
      T: () => Error$1
    }, {
      no: 19,
      name: "call_grants_updated",
      kind: "message",
      oneof: "eventPayload",
      T: () => CallGrantsUpdated
    }, {
      no: 20,
      name: "go_away",
      kind: "message",
      oneof: "eventPayload",
      T: () => GoAway
    }, {
      no: 21,
      name: "ice_restart",
      kind: "message",
      oneof: "eventPayload",
      T: () => ICERestart
    }, {
      no: 22,
      name: "pins_updated",
      kind: "message",
      oneof: "eventPayload",
      T: () => PinsChanged
    }, {
      no: 23,
      name: "call_ended",
      kind: "message",
      oneof: "eventPayload",
      T: () => CallEnded
    }, {
      no: 24,
      name: "participant_updated",
      kind: "message",
      oneof: "eventPayload",
      T: () => ParticipantUpdated
    }, {
      no: 25,
      name: "participant_migration_complete",
      kind: "message",
      oneof: "eventPayload",
      T: () => ParticipantMigrationComplete
    }, {
      no: 27,
      name: "change_publish_options",
      kind: "message",
      oneof: "eventPayload",
      T: () => ChangePublishOptions
    }]);
  }
};
var SfuEvent = new SfuEvent$Type();
var ChangePublishOptions$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ChangePublishOptions", [{
      no: 1,
      name: "publish_options",
      kind: "message",
      repeat: 1,
      T: () => PublishOption
    }, {
      no: 2,
      name: "reason",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var ChangePublishOptions = new ChangePublishOptions$Type();
var ChangePublishOptionsComplete$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ChangePublishOptionsComplete", []);
  }
};
var ChangePublishOptionsComplete = new ChangePublishOptionsComplete$Type();
var ParticipantMigrationComplete$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ParticipantMigrationComplete", []);
  }
};
var ParticipantMigrationComplete = new ParticipantMigrationComplete$Type();
var PinsChanged$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.PinsChanged", [{
      no: 1,
      name: "pins",
      kind: "message",
      repeat: 1,
      T: () => Pin
    }]);
  }
};
var PinsChanged = new PinsChanged$Type();
var Error$Type2 = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.Error", [{
      no: 4,
      name: "error",
      kind: "message",
      T: () => Error$2
    }, {
      no: 5,
      name: "reconnect_strategy",
      kind: "enum",
      T: () => ["stream.video.sfu.models.WebsocketReconnectStrategy", WebsocketReconnectStrategy, "WEBSOCKET_RECONNECT_STRATEGY_"]
    }]);
  }
};
var Error$1 = new Error$Type2();
var ICETrickle$Type2 = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ICETrickle", [{
      no: 1,
      name: "peer_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.PeerType", PeerType, "PEER_TYPE_"]
    }, {
      no: 2,
      name: "ice_candidate",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var ICETrickle = new ICETrickle$Type2();
var ICERestart$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ICERestart", [{
      no: 1,
      name: "peer_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.PeerType", PeerType, "PEER_TYPE_"]
    }]);
  }
};
var ICERestart = new ICERestart$Type();
var SfuRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.SfuRequest", [{
      no: 1,
      name: "join_request",
      kind: "message",
      oneof: "requestPayload",
      T: () => JoinRequest
    }, {
      no: 2,
      name: "health_check_request",
      kind: "message",
      oneof: "requestPayload",
      T: () => HealthCheckRequest
    }, {
      no: 3,
      name: "leave_call_request",
      kind: "message",
      oneof: "requestPayload",
      T: () => LeaveCallRequest
    }]);
  }
};
var SfuRequest = new SfuRequest$Type();
var LeaveCallRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.LeaveCallRequest", [{
      no: 1,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "reason",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var LeaveCallRequest = new LeaveCallRequest$Type();
var HealthCheckRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.HealthCheckRequest", []);
  }
};
var HealthCheckRequest = new HealthCheckRequest$Type();
var HealthCheckResponse$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.HealthCheckResponse", [{
      no: 1,
      name: "participant_count",
      kind: "message",
      T: () => ParticipantCount
    }]);
  }
};
var HealthCheckResponse = new HealthCheckResponse$Type();
var TrackPublished$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.TrackPublished", [{
      no: 1,
      name: "user_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.TrackType", TrackType, "TRACK_TYPE_"]
    }, {
      no: 4,
      name: "participant",
      kind: "message",
      T: () => Participant
    }]);
  }
};
var TrackPublished = new TrackPublished$Type();
var TrackUnpublished$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.TrackUnpublished", [{
      no: 1,
      name: "user_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.TrackType", TrackType, "TRACK_TYPE_"]
    }, {
      no: 4,
      name: "cause",
      kind: "enum",
      T: () => ["stream.video.sfu.models.TrackUnpublishReason", TrackUnpublishReason, "TRACK_UNPUBLISH_REASON_"]
    }, {
      no: 5,
      name: "participant",
      kind: "message",
      T: () => Participant
    }]);
  }
};
var TrackUnpublished = new TrackUnpublished$Type();
var JoinRequest$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.JoinRequest", [{
      no: 1,
      name: "token",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "subscriber_sdp",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 8,
      name: "publisher_sdp",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 4,
      name: "client_details",
      kind: "message",
      T: () => ClientDetails
    }, {
      no: 5,
      name: "migration",
      kind: "message",
      T: () => Migration
    }, {
      no: 6,
      name: "fast_reconnect",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 7,
      name: "reconnect_details",
      kind: "message",
      T: () => ReconnectDetails
    }, {
      no: 9,
      name: "preferred_publish_options",
      kind: "message",
      repeat: 1,
      T: () => PublishOption
    }, {
      no: 10,
      name: "preferred_subscribe_options",
      kind: "message",
      repeat: 1,
      T: () => SubscribeOption
    }]);
  }
};
var JoinRequest = new JoinRequest$Type();
var ReconnectDetails$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ReconnectDetails", [{
      no: 1,
      name: "strategy",
      kind: "enum",
      T: () => ["stream.video.sfu.models.WebsocketReconnectStrategy", WebsocketReconnectStrategy, "WEBSOCKET_RECONNECT_STRATEGY_"]
    }, {
      no: 3,
      name: "announced_tracks",
      kind: "message",
      repeat: 1,
      T: () => TrackInfo
    }, {
      no: 4,
      name: "subscriptions",
      kind: "message",
      repeat: 1,
      T: () => TrackSubscriptionDetails
    }, {
      no: 5,
      name: "reconnect_attempt",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }, {
      no: 6,
      name: "from_sfu_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 7,
      name: "previous_session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 8,
      name: "reason",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var ReconnectDetails = new ReconnectDetails$Type();
var Migration$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.Migration", [{
      no: 1,
      name: "from_sfu_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "announced_tracks",
      kind: "message",
      repeat: 1,
      T: () => TrackInfo
    }, {
      no: 3,
      name: "subscriptions",
      kind: "message",
      repeat: 1,
      T: () => TrackSubscriptionDetails
    }]);
  }
};
var Migration = new Migration$Type();
var JoinResponse$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.JoinResponse", [{
      no: 1,
      name: "call_state",
      kind: "message",
      T: () => CallState$1
    }, {
      no: 2,
      name: "reconnected",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 3,
      name: "fast_reconnect_deadline_seconds",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }, {
      no: 4,
      name: "publish_options",
      kind: "message",
      repeat: 1,
      T: () => PublishOption
    }]);
  }
};
var JoinResponse = new JoinResponse$Type();
var ParticipantJoined$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ParticipantJoined", [{
      no: 1,
      name: "call_cid",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "participant",
      kind: "message",
      T: () => Participant
    }]);
  }
};
var ParticipantJoined = new ParticipantJoined$Type();
var ParticipantLeft$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ParticipantLeft", [{
      no: 1,
      name: "call_cid",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "participant",
      kind: "message",
      T: () => Participant
    }]);
  }
};
var ParticipantLeft = new ParticipantLeft$Type();
var ParticipantUpdated$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ParticipantUpdated", [{
      no: 1,
      name: "call_cid",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "participant",
      kind: "message",
      T: () => Participant
    }]);
  }
};
var ParticipantUpdated = new ParticipantUpdated$Type();
var SubscriberOffer$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.SubscriberOffer", [{
      no: 1,
      name: "ice_restart",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 2,
      name: "sdp",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var SubscriberOffer = new SubscriberOffer$Type();
var PublisherAnswer$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.PublisherAnswer", [{
      no: 1,
      name: "sdp",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var PublisherAnswer = new PublisherAnswer$Type();
var ConnectionQualityChanged$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ConnectionQualityChanged", [{
      no: 1,
      name: "connection_quality_updates",
      kind: "message",
      repeat: 1,
      T: () => ConnectionQualityInfo
    }]);
  }
};
var ConnectionQualityChanged = new ConnectionQualityChanged$Type();
var ConnectionQualityInfo$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ConnectionQualityInfo", [{
      no: 1,
      name: "user_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "connection_quality",
      kind: "enum",
      T: () => ["stream.video.sfu.models.ConnectionQuality", ConnectionQuality, "CONNECTION_QUALITY_"]
    }]);
  }
};
var ConnectionQualityInfo = new ConnectionQualityInfo$Type();
var DominantSpeakerChanged$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.DominantSpeakerChanged", [{
      no: 1,
      name: "user_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var DominantSpeakerChanged = new DominantSpeakerChanged$Type();
var AudioLevel$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.AudioLevel", [{
      no: 1,
      name: "user_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "session_id",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 3,
      name: "level",
      kind: "scalar",
      T: 2
      /*ScalarType.FLOAT*/
    }, {
      no: 4,
      name: "is_speaking",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }]);
  }
};
var AudioLevel = new AudioLevel$Type();
var AudioLevelChanged$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.AudioLevelChanged", [{
      no: 1,
      name: "audio_levels",
      kind: "message",
      repeat: 1,
      T: () => AudioLevel
    }]);
  }
};
var AudioLevelChanged = new AudioLevelChanged$Type();
var AudioSender$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.AudioSender", [{
      no: 2,
      name: "codec",
      kind: "message",
      T: () => Codec
    }, {
      no: 3,
      name: "track_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.TrackType", TrackType, "TRACK_TYPE_"]
    }, {
      no: 4,
      name: "publish_option_id",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }]);
  }
};
var AudioSender = new AudioSender$Type();
var VideoLayerSetting$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.VideoLayerSetting", [{
      no: 1,
      name: "name",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }, {
      no: 2,
      name: "active",
      kind: "scalar",
      T: 8
      /*ScalarType.BOOL*/
    }, {
      no: 3,
      name: "max_bitrate",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }, {
      no: 4,
      name: "scale_resolution_down_by",
      kind: "scalar",
      T: 2
      /*ScalarType.FLOAT*/
    }, {
      no: 6,
      name: "codec",
      kind: "message",
      T: () => Codec
    }, {
      no: 7,
      name: "max_framerate",
      kind: "scalar",
      T: 13
      /*ScalarType.UINT32*/
    }, {
      no: 8,
      name: "scalability_mode",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var VideoLayerSetting = new VideoLayerSetting$Type();
var VideoSender$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.VideoSender", [{
      no: 2,
      name: "codec",
      kind: "message",
      T: () => Codec
    }, {
      no: 3,
      name: "layers",
      kind: "message",
      repeat: 1,
      T: () => VideoLayerSetting
    }, {
      no: 4,
      name: "track_type",
      kind: "enum",
      T: () => ["stream.video.sfu.models.TrackType", TrackType, "TRACK_TYPE_"]
    }, {
      no: 5,
      name: "publish_option_id",
      kind: "scalar",
      T: 5
      /*ScalarType.INT32*/
    }]);
  }
};
var VideoSender = new VideoSender$Type();
var ChangePublishQuality$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.ChangePublishQuality", [{
      no: 1,
      name: "audio_senders",
      kind: "message",
      repeat: 1,
      T: () => AudioSender
    }, {
      no: 2,
      name: "video_senders",
      kind: "message",
      repeat: 1,
      T: () => VideoSender
    }]);
  }
};
var ChangePublishQuality = new ChangePublishQuality$Type();
var CallGrantsUpdated$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.CallGrantsUpdated", [{
      no: 1,
      name: "current_grants",
      kind: "message",
      T: () => CallGrants
    }, {
      no: 2,
      name: "message",
      kind: "scalar",
      T: 9
      /*ScalarType.STRING*/
    }]);
  }
};
var CallGrantsUpdated = new CallGrantsUpdated$Type();
var GoAway$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.GoAway", [{
      no: 1,
      name: "reason",
      kind: "enum",
      T: () => ["stream.video.sfu.models.GoAwayReason", GoAwayReason, "GO_AWAY_REASON_"]
    }]);
  }
};
var GoAway = new GoAway$Type();
var CallEnded$Type = class extends MessageType {
  constructor() {
    super("stream.video.sfu.event.CallEnded", [{
      no: 1,
      name: "reason",
      kind: "enum",
      T: () => ["stream.video.sfu.models.CallEndedReason", CallEndedReason, "CALL_ENDED_REASON_"]
    }]);
  }
};
var CallEnded = new CallEnded$Type();
var events = Object.freeze({
  __proto__: null,
  AudioLevel,
  AudioLevelChanged,
  AudioSender,
  CallEnded,
  CallGrantsUpdated,
  ChangePublishOptions,
  ChangePublishOptionsComplete,
  ChangePublishQuality,
  ConnectionQualityChanged,
  ConnectionQualityInfo,
  DominantSpeakerChanged,
  Error: Error$1,
  GoAway,
  HealthCheckRequest,
  HealthCheckResponse,
  ICERestart,
  ICETrickle,
  JoinRequest,
  JoinResponse,
  LeaveCallRequest,
  Migration,
  ParticipantJoined,
  ParticipantLeft,
  ParticipantMigrationComplete,
  ParticipantUpdated,
  PinsChanged,
  PublisherAnswer,
  ReconnectDetails,
  SfuEvent,
  SfuRequest,
  SubscriberOffer,
  TrackPublished,
  TrackUnpublished,
  VideoLayerSetting,
  VideoSender
});
var VisibilityState;
(function(VisibilityState2) {
  VisibilityState2["UNKNOWN"] = "UNKNOWN";
  VisibilityState2["VISIBLE"] = "VISIBLE";
  VisibilityState2["INVISIBLE"] = "INVISIBLE";
})(VisibilityState || (VisibilityState = {}));
var DebounceType;
(function(DebounceType2) {
  DebounceType2[DebounceType2["IMMEDIATE"] = 20] = "IMMEDIATE";
  DebounceType2[DebounceType2["FAST"] = 100] = "FAST";
  DebounceType2[DebounceType2["MEDIUM"] = 600] = "MEDIUM";
  DebounceType2[DebounceType2["SLOW"] = 1200] = "SLOW";
})(DebounceType || (DebounceType = {}));
var SignalServerClient = class {
  constructor(_transport) {
    this._transport = _transport;
    this.typeName = SignalServer.typeName;
    this.methods = SignalServer.methods;
    this.options = SignalServer.options;
  }
  /**
   * SetPublisher sends the WebRTC offer for the peer connection used to publish A/V
   *
   * @generated from protobuf rpc: SetPublisher(stream.video.sfu.signal.SetPublisherRequest) returns (stream.video.sfu.signal.SetPublisherResponse);
   */
  setPublisher(input, options) {
    const method = this.methods[0], opt = this._transport.mergeOptions(options);
    return stackIntercept("unary", this._transport, method, opt, input);
  }
  /**
   * answer is sent by the client to the SFU after receiving a subscriber_offer.
   *
   * @generated from protobuf rpc: SendAnswer(stream.video.sfu.signal.SendAnswerRequest) returns (stream.video.sfu.signal.SendAnswerResponse);
   */
  sendAnswer(input, options) {
    const method = this.methods[1], opt = this._transport.mergeOptions(options);
    return stackIntercept("unary", this._transport, method, opt, input);
  }
  /**
   * SendICECandidate sends an ICE candidate to the client
   *
   * @generated from protobuf rpc: IceTrickle(stream.video.sfu.models.ICETrickle) returns (stream.video.sfu.signal.ICETrickleResponse);
   */
  iceTrickle(input, options) {
    const method = this.methods[2], opt = this._transport.mergeOptions(options);
    return stackIntercept("unary", this._transport, method, opt, input);
  }
  /**
   * UpdateSubscribers is used to notify the SFU about the list of video subscriptions
   * TODO: sync subscriptions based on this + update tracks using the dimension info sent by the user
   *
   * @generated from protobuf rpc: UpdateSubscriptions(stream.video.sfu.signal.UpdateSubscriptionsRequest) returns (stream.video.sfu.signal.UpdateSubscriptionsResponse);
   */
  updateSubscriptions(input, options) {
    const method = this.methods[3], opt = this._transport.mergeOptions(options);
    return stackIntercept("unary", this._transport, method, opt, input);
  }
  /**
   * @generated from protobuf rpc: UpdateMuteStates(stream.video.sfu.signal.UpdateMuteStatesRequest) returns (stream.video.sfu.signal.UpdateMuteStatesResponse);
   */
  updateMuteStates(input, options) {
    const method = this.methods[4], opt = this._transport.mergeOptions(options);
    return stackIntercept("unary", this._transport, method, opt, input);
  }
  /**
   * @generated from protobuf rpc: IceRestart(stream.video.sfu.signal.ICERestartRequest) returns (stream.video.sfu.signal.ICERestartResponse);
   */
  iceRestart(input, options) {
    const method = this.methods[5], opt = this._transport.mergeOptions(options);
    return stackIntercept("unary", this._transport, method, opt, input);
  }
  /**
   * @generated from protobuf rpc: SendStats(stream.video.sfu.signal.SendStatsRequest) returns (stream.video.sfu.signal.SendStatsResponse);
   */
  sendStats(input, options) {
    const method = this.methods[6], opt = this._transport.mergeOptions(options);
    return stackIntercept("unary", this._transport, method, opt, input);
  }
  /**
   * @generated from protobuf rpc: StartNoiseCancellation(stream.video.sfu.signal.StartNoiseCancellationRequest) returns (stream.video.sfu.signal.StartNoiseCancellationResponse);
   */
  startNoiseCancellation(input, options) {
    const method = this.methods[7], opt = this._transport.mergeOptions(options);
    return stackIntercept("unary", this._transport, method, opt, input);
  }
  /**
   * @generated from protobuf rpc: StopNoiseCancellation(stream.video.sfu.signal.StopNoiseCancellationRequest) returns (stream.video.sfu.signal.StopNoiseCancellationResponse);
   */
  stopNoiseCancellation(input, options) {
    const method = this.methods[8], opt = this._transport.mergeOptions(options);
    return stackIntercept("unary", this._transport, method, opt, input);
  }
};
var defaultOptions = {
  baseUrl: "",
  sendJson: true,
  timeout: 5 * 1e3,
  // ms.
  jsonOptions: {
    ignoreUnknownFields: true
  }
};
var withHeaders = (headers) => {
  return {
    interceptUnary(next, method, input, options) {
      options.meta = __spreadValues(__spreadValues({}, options.meta), headers);
      return next(method, input, options);
    }
  };
};
var withRequestLogger = (logger2, level2) => {
  return {
    interceptUnary: (next, method, input, options) => {
      let invocation;
      try {
        invocation = next(method, input, options);
      } finally {
        logger2(level2, `Invoked SFU RPC method ${method.name}`, {
          request: invocation?.request,
          headers: invocation?.requestHeaders,
          response: invocation?.response
        });
      }
      return invocation;
    }
  };
};
var withRequestTracer = (trace) => {
  const exclusions = {
    SendStats: true
  };
  return {
    interceptUnary(next, method, input, options) {
      if (exclusions[method.name]) {
        return next(method, input, options);
      }
      try {
        trace(method.name, input);
        return next(method, input, options);
      } catch (err) {
        trace(`${method.name}OnFailure`, [input, err]);
        throw err;
      }
    }
  };
};
var createSignalClient = (options) => {
  const transport = new TwirpFetchTransport(__spreadValues(__spreadValues({}, defaultOptions), options));
  return new SignalServerClient(transport);
};
var sleep = (m) => new Promise((r) => setTimeout(r, m));
function isFunction(value) {
  return value && (Object.prototype.toString.call(value) === "[object Function]" || "function" === typeof value || value instanceof Function);
}
var KnownCodes = {
  TOKEN_EXPIRED: 40,
  WS_CLOSED_SUCCESS: 1e3
};
function retryInterval(numberOfFailures) {
  const max = Math.min(500 + numberOfFailures * 2e3, 5e3);
  const min = Math.min(Math.max(250, (numberOfFailures - 1) * 2e3), 5e3);
  return Math.floor(Math.random() * (max - min) + min);
}
function hex(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i].toString(16).padStart(2, "0");
  }
  return s;
}
function generateUUIDv4() {
  const bytes = getRandomBytes(16);
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 191 | 128;
  return [hex(bytes.subarray(0, 4)), hex(bytes.subarray(4, 6)), hex(bytes.subarray(6, 8)), hex(bytes.subarray(8, 10)), hex(bytes.subarray(10, 16))].join("-");
}
var getRandomValues = (() => {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return crypto.getRandomValues.bind(crypto);
  }
  return function getRandomValuesWithMathRandom(bytes) {
    const max = Math.pow(2, 8 * bytes.byteLength / bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.random() * max;
    }
  };
})();
function getRandomBytes(length) {
  const bytes = new Uint8Array(length);
  getRandomValues(bytes);
  return bytes;
}
function addConnectionEventListeners(cb) {
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("offline", cb);
    window.addEventListener("online", cb);
  }
}
function removeConnectionEventListeners(cb) {
  if (typeof window !== "undefined" && window.removeEventListener) {
    window.removeEventListener("offline", cb);
    window.removeEventListener("online", cb);
  }
}
function isErrorResponse(res) {
  return !res.status || res.status < 200 || 300 <= res.status;
}
function isCloseEvent(res) {
  return res.code !== void 0;
}
var isReactNative = () => {
  if (typeof navigator === "undefined") return false;
  return navigator.product?.toLowerCase() === "reactnative";
};
var logLevels = Object.freeze({
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4
});
var logger;
var level = "info";
var logToConsole = (logLevel, message, ...args) => {
  let logMethod;
  switch (logLevel) {
    case "error":
      if (isReactNative()) {
        message = `ERROR: ${message}`;
        logMethod = console.info;
        break;
      }
      logMethod = console.error;
      break;
    case "warn":
      if (isReactNative()) {
        message = `WARN: ${message}`;
        logMethod = console.info;
        break;
      }
      logMethod = console.warn;
      break;
    case "info":
      logMethod = console.info;
      break;
    case "trace":
      logMethod = console.trace;
      break;
    default:
      logMethod = console.log;
      break;
  }
  logMethod(message, ...args);
};
var setLogger = (l, lvl) => {
  logger = l;
  if (lvl) {
    setLogLevel(lvl);
  }
};
var setLogLevel = (l) => {
  level = l;
};
var getLogLevel = () => level;
var getLogger = (withTags) => {
  const loggerMethod = logger || logToConsole;
  const tags = (withTags || []).filter(Boolean).join(":");
  const result = (logLevel, message, ...args) => {
    if (logLevels[logLevel] >= logLevels[level]) {
      loggerMethod(logLevel, `[${tags}]: ${message}`, ...args);
    }
  };
  return result;
};
var retryable = (rpc, signal) => __async(void 0, null, function* () {
  let attempt = 0;
  let result = void 0;
  do {
    if (attempt > 0) yield sleep(retryInterval(attempt));
    try {
      result = yield rpc();
    } catch (err) {
      const isRequestCancelled = err instanceof RpcError && err.code === TwirpErrorCode[TwirpErrorCode.cancelled];
      const isAborted = signal?.aborted ?? false;
      if (isRequestCancelled || isAborted) throw err;
      getLogger(["sfu-client", "rpc"])("debug", `rpc failed (${attempt})`, err);
      attempt++;
    }
  } while (!result || result.response.error?.shouldRetry);
  return result;
});
var getGenericSdp = (direction) => __async(void 0, null, function* () {
  const tempPc = new RTCPeerConnection();
  tempPc.addTransceiver("video", {
    direction
  });
  tempPc.addTransceiver("audio", {
    direction
  });
  const offer = yield tempPc.createOffer();
  const sdp2 = offer.sdp ?? "";
  tempPc.getTransceivers().forEach((t) => {
    t.stop?.();
  });
  tempPc.close();
  return sdp2;
});
var isSvcCodec = (codecOrMimeType) => {
  if (!codecOrMimeType) return false;
  codecOrMimeType = codecOrMimeType.toLowerCase();
  return codecOrMimeType === "vp9" || codecOrMimeType === "av1" || codecOrMimeType === "video/vp9" || codecOrMimeType === "video/av1";
};
var sfuEventKinds = {
  subscriberOffer: void 0,
  publisherAnswer: void 0,
  connectionQualityChanged: void 0,
  audioLevelChanged: void 0,
  iceTrickle: void 0,
  changePublishQuality: void 0,
  participantJoined: void 0,
  participantLeft: void 0,
  dominantSpeakerChanged: void 0,
  joinResponse: void 0,
  healthCheckResponse: void 0,
  trackPublished: void 0,
  trackUnpublished: void 0,
  error: void 0,
  callGrantsUpdated: void 0,
  goAway: void 0,
  iceRestart: void 0,
  pinsUpdated: void 0,
  callEnded: void 0,
  participantUpdated: void 0,
  participantMigrationComplete: void 0,
  changePublishOptions: void 0
};
var isSfuEvent = (eventName) => {
  return Object.prototype.hasOwnProperty.call(sfuEventKinds, eventName);
};
var Dispatcher = class {
  constructor() {
    this.logger = getLogger(["Dispatcher"]);
    this.subscribers = {};
    this.dispatch = (message, logTag = "0") => {
      const eventKind = message.eventPayload.oneofKind;
      if (!eventKind) return;
      const payload = message.eventPayload[eventKind];
      this.logger("debug", `Dispatching ${eventKind}, tag=${logTag}`, payload);
      const listeners = this.subscribers[eventKind];
      if (!listeners) return;
      for (const fn of listeners) {
        try {
          fn(payload);
        } catch (e) {
          this.logger("warn", "Listener failed with error", e);
        }
      }
    };
    this.on = (eventName, fn) => {
      var _a;
      ((_a = this.subscribers)[eventName] ?? (_a[eventName] = [])).push(fn);
      return () => {
        this.off(eventName, fn);
      };
    };
    this.off = (eventName, fn) => {
      this.subscribers[eventName] = (this.subscribers[eventName] || []).filter((f) => f !== fn);
    };
  }
};
var IceTrickleBuffer = class {
  constructor() {
    this.subscriberCandidates = new ReplaySubject();
    this.publisherCandidates = new ReplaySubject();
    this.push = (iceTrickle) => {
      const iceCandidate = toIceCandidate(iceTrickle);
      if (!iceCandidate) return;
      if (iceTrickle.peerType === PeerType.SUBSCRIBER) {
        this.subscriberCandidates.next(iceCandidate);
      } else if (iceTrickle.peerType === PeerType.PUBLISHER_UNSPECIFIED) {
        this.publisherCandidates.next(iceCandidate);
      } else {
        const logger2 = getLogger(["sfu-client"]);
        logger2("warn", `ICETrickle, Unknown peer type`, iceTrickle);
      }
    };
    this.dispose = () => {
      this.subscriberCandidates.complete();
      this.publisherCandidates.complete();
    };
  }
};
var toIceCandidate = (iceTrickle) => {
  try {
    return JSON.parse(iceTrickle.iceCandidate);
  } catch (e) {
    const logger2 = getLogger(["sfu-client"]);
    logger2("error", `Failed to parse ICE Trickle`, e, iceTrickle);
    return void 0;
  }
};
var withoutConcurrency = createRunner(wrapWithContinuationTracking);
var withCancellation = createRunner(wrapWithCancellation);
var pendingPromises = /* @__PURE__ */ new Map();
function hasPending(tag) {
  return pendingPromises.has(tag);
}
function settled(tag) {
  return __async(this, null, function* () {
    let pending;
    while (pending = pendingPromises.get(tag)) {
      yield pending.promise;
    }
  });
}
function createRunner(wrapper) {
  return function run(tag, cb) {
    const {
      cb: wrapped,
      onContinued
    } = wrapper(tag, cb);
    const pending = pendingPromises.get(tag);
    pending?.onContinued();
    const promise = pending ? pending.promise.then(wrapped, wrapped) : wrapped();
    pendingPromises.set(tag, {
      promise,
      onContinued
    });
    return promise;
  };
}
function wrapWithContinuationTracking(tag, cb) {
  let hasContinuation = false;
  const wrapped = () => cb().finally(() => {
    if (!hasContinuation) {
      pendingPromises.delete(tag);
    }
  });
  const onContinued = () => hasContinuation = true;
  return {
    cb: wrapped,
    onContinued
  };
}
function wrapWithCancellation(tag, cb) {
  const ac = new AbortController();
  const wrapped = () => {
    if (ac.signal.aborted) {
      return Promise.resolve("canceled");
    }
    return cb(ac.signal).finally(() => {
      if (!ac.signal.aborted) {
        pendingPromises.delete(tag);
      }
    });
  };
  const onContinued = () => ac.abort();
  return {
    cb: wrapped,
    onContinued
  };
}
var isFunctionPatch = (update) => typeof update === "function";
var getCurrentValue = (observable$) => {
  let value;
  let err = void 0;
  combineLatest([observable$]).subscribe({
    next: ([v]) => {
      value = v;
    },
    error: (e) => {
      err = e;
    }
  }).unsubscribe();
  if (err) throw err;
  return value;
};
var setCurrentValue = (subject, update) => {
  const next = isFunctionPatch(update) ? update(getCurrentValue(subject)) : update;
  subject.next(next);
  return next;
};
var updateValue = (subject, update) => {
  const lastValue = subject.getValue();
  const value = setCurrentValue(subject, update);
  return {
    lastValue,
    value,
    rollback: () => setCurrentValue(subject, lastValue)
  };
};
var createSubscription = (observable, handler, onError = (error) => getLogger(["RxUtils"])("warn", "An observable emitted an error", error)) => {
  const subscription = observable.subscribe({
    next: handler,
    error: onError
  });
  return () => {
    subscription.unsubscribe();
  };
};
var createSafeAsyncSubscription = (observable, handler) => {
  const tag = Symbol();
  return createSubscription(observable, (value) => {
    withoutConcurrency(tag, () => handler(value));
  });
};
var rxUtils = Object.freeze({
  __proto__: null,
  createSafeAsyncSubscription,
  createSubscription,
  getCurrentValue,
  setCurrentValue,
  updateValue
});
var CallingState;
(function(CallingState2) {
  CallingState2["UNKNOWN"] = "unknown";
  CallingState2["IDLE"] = "idle";
  CallingState2["RINGING"] = "ringing";
  CallingState2["JOINING"] = "joining";
  CallingState2["JOINED"] = "joined";
  CallingState2["LEFT"] = "left";
  CallingState2["RECONNECTING"] = "reconnecting";
  CallingState2["MIGRATING"] = "migrating";
  CallingState2["RECONNECTING_FAILED"] = "reconnecting-failed";
  CallingState2["OFFLINE"] = "offline";
})(CallingState || (CallingState = {}));
var StreamVideoWriteableStateStore = class {
  constructor() {
    this.connectedUserSubject = new BehaviorSubject(void 0);
    this.callsSubject = new BehaviorSubject([]);
    this.setConnectedUser = (user) => {
      return setCurrentValue(this.connectedUserSubject, user);
    };
    this.setCalls = (calls) => {
      return setCurrentValue(this.callsSubject, calls);
    };
    this.registerCall = (call) => {
      if (!this.calls.find((c) => c.cid === call.cid)) {
        this.setCalls((calls) => [...calls, call]);
      }
    };
    this.unregisterCall = (call) => {
      const logger2 = getLogger(["client-state"]);
      logger2("trace", `Unregistering call: ${call.cid}`);
      return this.setCalls((calls) => calls.filter((c) => c !== call));
    };
    this.findCall = (type, id) => {
      return this.calls.find((c) => c.type === type && c.id === id);
    };
    this.connectedUserSubject.subscribe((user) => __async(this, null, function* () {
      if (!user) {
        const logger2 = getLogger(["client-state"]);
        for (const call of this.calls) {
          if (call.state.callingState === CallingState.LEFT) continue;
          logger2("info", `User disconnected, leaving call: ${call.cid}`);
          yield call.leave({
            message: "client.disconnectUser() called"
          }).catch((err) => {
            logger2("error", `Error leaving call: ${call.cid}`, err);
          });
        }
      }
    }));
  }
  /**
   * The currently connected user.
   */
  get connectedUser() {
    return getCurrentValue(this.connectedUserSubject);
  }
  /**
   * A list of {@link Call} objects created/tracked by this client.
   */
  get calls() {
    return getCurrentValue(this.callsSubject);
  }
};
var StreamVideoReadOnlyStateStore = class {
  constructor(store) {
    this.getCurrentValue = getCurrentValue;
    this.connectedUser$ = store.connectedUserSubject.asObservable();
    this.calls$ = store.callsSubject.asObservable();
  }
  /**
   * The current user connected over WS to the backend.
   */
  get connectedUser() {
    return getCurrentValue(this.connectedUser$);
  }
  /**
   * A list of {@link Call} objects created/tracked by this client.
   */
  get calls() {
    return getCurrentValue(this.calls$);
  }
};
var combineComparators = (...comparators) => {
  return (a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
};
var descending = (comparator) => {
  return (a, b) => comparator(b, a);
};
var conditional = (predicate) => {
  return (comparator) => {
    return (a, b) => {
      if (!predicate(a, b)) return 0;
      return comparator(a, b);
    };
  };
};
var noopComparator = () => {
  return () => 0;
};
var hasVideo = (p) => p.publishedTracks.includes(TrackType.VIDEO);
var hasAudio = (p) => p.publishedTracks.includes(TrackType.AUDIO);
var hasScreenShare = (p) => p.publishedTracks.includes(TrackType.SCREEN_SHARE);
var hasScreenShareAudio = (p) => p.publishedTracks.includes(TrackType.SCREEN_SHARE_AUDIO);
var isPinned = (p) => !!p.pin && (p.pin.isLocalPin || p.pin.pinnedAt > 0);
var dominantSpeaker = (a, b) => {
  if (a.isDominantSpeaker && !b.isDominantSpeaker) return -1;
  if (!a.isDominantSpeaker && b.isDominantSpeaker) return 1;
  return 0;
};
var speaking = (a, b) => {
  if (a.isSpeaking && !b.isSpeaking) return -1;
  if (!a.isSpeaking && b.isSpeaking) return 1;
  return 0;
};
var screenSharing = (a, b) => {
  if (hasScreenShare(a) && !hasScreenShare(b)) return -1;
  if (!hasScreenShare(a) && hasScreenShare(b)) return 1;
  return 0;
};
var publishingVideo = (a, b) => {
  if (hasVideo(a) && !hasVideo(b)) return -1;
  if (!hasVideo(a) && hasVideo(b)) return 1;
  return 0;
};
var publishingAudio = (a, b) => {
  if (hasAudio(a) && !hasAudio(b)) return -1;
  if (!hasAudio(a) && hasAudio(b)) return 1;
  return 0;
};
var pinned = (a, b) => {
  if (a.pin && b.pin) {
    if (!a.pin.isLocalPin && b.pin.isLocalPin) return -1;
    if (a.pin.isLocalPin && !b.pin.isLocalPin) return 1;
    if (a.pin.pinnedAt > b.pin.pinnedAt) return -1;
    if (a.pin.pinnedAt < b.pin.pinnedAt) return 1;
  }
  if (a.pin && !b.pin) return -1;
  if (!a.pin && b.pin) return 1;
  return 0;
};
var reactionType = (type) => {
  return (a, b) => {
    if (a.reaction?.type === type && b.reaction?.type !== type) return -1;
    if (a.reaction?.type !== type && b.reaction?.type === type) return 1;
    return 0;
  };
};
var role = (...roles) => (a, b) => {
  if (hasAnyRole(a, roles) && !hasAnyRole(b, roles)) return -1;
  if (!hasAnyRole(a, roles) && hasAnyRole(b, roles)) return 1;
  return 0;
};
var name = (a, b) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
};
var hasAnyRole = (p, roles) => (p.roles || []).some((r) => roles.includes(r));
var ifInvisibleBy = conditional((a, b) => a.viewportVisibilityState?.videoTrack === VisibilityState.INVISIBLE || b.viewportVisibilityState?.videoTrack === VisibilityState.INVISIBLE);
var ifInvisibleOrUnknownBy = conditional((a, b) => a.viewportVisibilityState?.videoTrack === VisibilityState.INVISIBLE || a.viewportVisibilityState?.videoTrack === VisibilityState.UNKNOWN || b.viewportVisibilityState?.videoTrack === VisibilityState.INVISIBLE || b.viewportVisibilityState?.videoTrack === VisibilityState.UNKNOWN);
var defaultSortPreset = combineComparators(pinned, screenSharing, ifInvisibleBy(combineComparators(dominantSpeaker, speaking, reactionType("raised-hand"), publishingVideo, publishingAudio)));
var speakerLayoutSortPreset = combineComparators(pinned, screenSharing, dominantSpeaker, ifInvisibleBy(combineComparators(speaking, reactionType("raised-hand"), publishingVideo, publishingAudio)));
var paginatedLayoutSortPreset = combineComparators(pinned, ifInvisibleOrUnknownBy(combineComparators(dominantSpeaker, speaking, reactionType("raised-hand"), publishingVideo, publishingAudio)));
var livestreamOrAudioRoomSortPreset = combineComparators(ifInvisibleBy(combineComparators(dominantSpeaker, speaking, reactionType("raised-hand"), publishingVideo, publishingAudio)), role("admin", "host", "speaker"));
var defaultEgress = {
  broadcasting: false,
  hls: {
    playlist_url: "",
    status: ""
  },
  rtmps: []
};
var CallState = class {
  /**
   * Creates a new instance of the CallState class.
   *
   */
  constructor() {
    this.backstageSubject = new BehaviorSubject(true);
    this.blockedUserIdsSubject = new BehaviorSubject([]);
    this.createdAtSubject = new BehaviorSubject(/* @__PURE__ */ new Date());
    this.endedAtSubject = new BehaviorSubject(void 0);
    this.startsAtSubject = new BehaviorSubject(void 0);
    this.updatedAtSubject = new BehaviorSubject(/* @__PURE__ */ new Date());
    this.createdBySubject = new BehaviorSubject(void 0);
    this.customSubject = new BehaviorSubject({});
    this.egressSubject = new BehaviorSubject(void 0);
    this.ingressSubject = new BehaviorSubject(void 0);
    this.recordingSubject = new BehaviorSubject(false);
    this.sessionSubject = new BehaviorSubject(void 0);
    this.settingsSubject = new BehaviorSubject(void 0);
    this.transcribingSubject = new BehaviorSubject(false);
    this.captioningSubject = new BehaviorSubject(false);
    this.endedBySubject = new BehaviorSubject(void 0);
    this.thumbnailsSubject = new BehaviorSubject(void 0);
    this.membersSubject = new BehaviorSubject([]);
    this.ownCapabilitiesSubject = new BehaviorSubject([]);
    this.callingStateSubject = new BehaviorSubject(CallingState.UNKNOWN);
    this.startedAtSubject = new BehaviorSubject(void 0);
    this.participantCountSubject = new BehaviorSubject(0);
    this.anonymousParticipantCountSubject = new BehaviorSubject(0);
    this.participantsSubject = new BehaviorSubject([]);
    this.callStatsReportSubject = new BehaviorSubject(void 0);
    this.closedCaptionsSubject = new BehaviorSubject([]);
    this.orphanedTracks = [];
    this.logger = getLogger(["CallState"]);
    this.sortParticipantsBy = defaultSortPreset;
    this.closedCaptionsTasks = /* @__PURE__ */ new Map();
    this.dispose = () => {
      for (const [ccKey, taskId] of this.closedCaptionsTasks.entries()) {
        clearTimeout(taskId);
        this.closedCaptionsTasks.delete(ccKey);
      }
    };
    this.setSortParticipantsBy = (comparator) => {
      this.sortParticipantsBy = comparator;
      this.setCurrentValue(this.participantsSubject, (ps) => ps);
    };
    this.getCurrentValue = getCurrentValue;
    this.setCurrentValue = setCurrentValue;
    this.setParticipantCount = (count) => {
      return this.setCurrentValue(this.participantCountSubject, count);
    };
    this.setStartedAt = (startedAt) => {
      return this.setCurrentValue(this.startedAtSubject, startedAt);
    };
    this.setCaptioning = (captioning) => {
      return updateValue(this.captioningSubject, captioning);
    };
    this.setAnonymousParticipantCount = (count) => {
      return this.setCurrentValue(this.anonymousParticipantCountSubject, count);
    };
    this.setParticipants = (participants) => {
      return this.setCurrentValue(this.participantsSubject, participants);
    };
    this.setCallingState = (state) => {
      return this.setCurrentValue(this.callingStateSubject, state);
    };
    this.setCallStatsReport = (report) => {
      return this.setCurrentValue(this.callStatsReportSubject, report);
    };
    this.setMembers = (members) => {
      this.setCurrentValue(this.membersSubject, members);
    };
    this.setOwnCapabilities = (capabilities) => {
      return this.setCurrentValue(this.ownCapabilitiesSubject, capabilities);
    };
    this.setBackstage = (backstage) => {
      return this.setCurrentValue(this.backstageSubject, backstage);
    };
    this.setEndedAt = (endedAt) => {
      return this.setCurrentValue(this.endedAtSubject, endedAt);
    };
    this.findParticipantBySessionId = (sessionId) => {
      return this.participants.find((p) => p.sessionId === sessionId);
    };
    this.getParticipantLookupBySessionId = () => {
      return this.participants.reduce((lookupTable, participant) => {
        lookupTable[participant.sessionId] = participant;
        return lookupTable;
      }, {});
    };
    this.updateParticipant = (sessionId, patch2) => {
      const participant = this.findParticipantBySessionId(sessionId);
      if (!participant) {
        this.logger("warn", `Participant with sessionId ${sessionId} not found`);
        return;
      }
      const thePatch = typeof patch2 === "function" ? patch2(participant) : patch2;
      const updatedParticipant = __spreadValues(__spreadValues({}, participant), thePatch);
      return this.setParticipants((participants) => participants.map((p) => p.sessionId === sessionId ? updatedParticipant : p));
    };
    this.updateOrAddParticipant = (sessionId, participant) => {
      return this.setParticipants((participants) => {
        let add = true;
        const nextParticipants = participants.map((p) => {
          if (p.sessionId === sessionId) {
            add = false;
            return __spreadValues(__spreadValues({}, p), participant);
          }
          return p;
        });
        if (add) nextParticipants.push(participant);
        return nextParticipants;
      });
    };
    this.updateParticipants = (patch2) => {
      if (Object.keys(patch2).length === 0) return this.participants;
      return this.setParticipants((participants) => participants.map((p) => {
        const thePatch = patch2[p.sessionId];
        if (thePatch) {
          return __spreadValues(__spreadValues({}, p), thePatch);
        }
        return p;
      }));
    };
    this.updateParticipantTracks = (trackType, changes) => {
      return this.updateParticipants(Object.entries(changes).reduce((acc, [sessionId, change]) => {
        if (change.dimension) {
          change.dimension.height = Math.ceil(change.dimension.height);
          change.dimension.width = Math.ceil(change.dimension.width);
        }
        const prop = trackType === "videoTrack" ? "videoDimension" : trackType === "screenShareTrack" ? "screenShareDimension" : void 0;
        if (prop) {
          acc[sessionId] = {
            [prop]: change.dimension
          };
        }
        return acc;
      }, {}));
    };
    this.updateFromEvent = (event) => {
      const update = this.eventHandlers[event.type];
      if (update) {
        update(event);
      }
    };
    this.setServerSidePins = (pins) => {
      const pinsLookup = pins.reduce((lookup, pin) => {
        lookup[pin.sessionId] = Date.now();
        return lookup;
      }, {});
      return this.setParticipants((participants) => participants.map((participant) => {
        const serverSidePinnedAt = pinsLookup[participant.sessionId];
        if (serverSidePinnedAt) {
          return __spreadProps(__spreadValues({}, participant), {
            pin: {
              isLocalPin: false,
              pinnedAt: serverSidePinnedAt
            }
          });
        }
        if (participant.pin && !participant.pin.isLocalPin) {
          return __spreadProps(__spreadValues({}, participant), {
            pin: void 0
          });
        }
        return participant;
      }));
    };
    this.registerOrphanedTrack = (orphanedTrack) => {
      this.orphanedTracks.push(orphanedTrack);
    };
    this.removeOrphanedTrack = (id) => {
      this.orphanedTracks = this.orphanedTracks.filter((o) => o.id !== id);
    };
    this.takeOrphanedTracks = (trackLookupPrefix) => {
      const orphans = this.orphanedTracks.filter((orphan) => orphan.trackLookupPrefix === trackLookupPrefix);
      if (orphans.length > 0) {
        this.orphanedTracks = this.orphanedTracks.filter((orphan) => orphan.trackLookupPrefix !== trackLookupPrefix);
      }
      return orphans;
    };
    this.updateClosedCaptionSettings = (config) => {
      this.closedCaptionsSettings = __spreadValues(__spreadValues({}, this.closedCaptionsSettings), config);
    };
    this.updateFromCallResponse = (call) => {
      this.setBackstage(call.backstage);
      this.setCurrentValue(this.blockedUserIdsSubject, call.blocked_user_ids);
      this.setCurrentValue(this.createdAtSubject, new Date(call.created_at));
      this.setCurrentValue(this.updatedAtSubject, new Date(call.updated_at));
      this.setCurrentValue(this.startsAtSubject, call.starts_at ? new Date(call.starts_at) : void 0);
      this.setEndedAt(call.ended_at ? new Date(call.ended_at) : void 0);
      this.setCurrentValue(this.createdBySubject, call.created_by);
      this.setCurrentValue(this.customSubject, call.custom);
      this.setCurrentValue(this.egressSubject, call.egress);
      this.setCurrentValue(this.ingressSubject, call.ingress);
      this.setCurrentValue(this.recordingSubject, call.recording);
      const s = this.setCurrentValue(this.sessionSubject, call.session);
      this.updateParticipantCountFromSession(s);
      this.setCurrentValue(this.settingsSubject, call.settings);
      this.setCurrentValue(this.transcribingSubject, call.transcribing);
      this.setCurrentValue(this.captioningSubject, call.captioning);
      this.setCurrentValue(this.thumbnailsSubject, call.thumbnails);
    };
    this.updateFromSfuCallState = (callState, currentSessionId, reconnectDetails) => {
      const {
        participants,
        participantCount,
        startedAt,
        pins
      } = callState;
      const localPublishedTracks = reconnectDetails?.announcedTracks.map((t) => t.trackType) ?? [];
      this.setParticipants(() => {
        const participantLookup = this.getParticipantLookupBySessionId();
        return participants.map((p) => {
          const existingParticipant = participantLookup[p.sessionId];
          const isLocalParticipant = p.sessionId === currentSessionId;
          return Object.assign({}, existingParticipant, p, {
            isLocalParticipant,
            publishedTracks: isLocalParticipant ? localPublishedTracks : p.publishedTracks,
            viewportVisibilityState: existingParticipant?.viewportVisibilityState ?? {
              videoTrack: VisibilityState.UNKNOWN,
              screenShareTrack: VisibilityState.UNKNOWN
            }
          });
        });
      });
      this.setParticipantCount(participantCount?.total || 0);
      this.setAnonymousParticipantCount(participantCount?.anonymous || 0);
      this.setStartedAt(startedAt ? Timestamp.toDate(startedAt) : /* @__PURE__ */ new Date());
      this.setServerSidePins(pins);
    };
    this.updateFromMemberRemoved = (event) => {
      this.updateFromCallResponse(event.call);
      this.setCurrentValue(this.membersSubject, (members) => members.filter((m) => event.members.indexOf(m.user_id) === -1));
    };
    this.updateFromMemberAdded = (event) => {
      this.updateFromCallResponse(event.call);
      this.setCurrentValue(this.membersSubject, (members) => [...members, ...event.members]);
    };
    this.updateFromHLSBroadcastStopped = () => {
      this.setCurrentValue(this.egressSubject, (egress = defaultEgress) => __spreadProps(__spreadValues({}, egress), {
        broadcasting: false,
        hls: __spreadProps(__spreadValues({}, egress.hls), {
          status: ""
        })
      }));
    };
    this.updateFromHLSBroadcastingFailed = () => {
      this.setCurrentValue(this.egressSubject, (egress = defaultEgress) => __spreadProps(__spreadValues({}, egress), {
        broadcasting: false,
        hls: __spreadProps(__spreadValues({}, egress.hls), {
          status: ""
        })
      }));
    };
    this.updateParticipantCountFromSession = (session) => {
      if (!session || this.callingState === CallingState.JOINED) return;
      const byRoleCount = Object.values(session.participants_count_by_role).reduce((total, countByRole) => total + countByRole, 0);
      const participantCount = Math.max(byRoleCount, session.participants.length);
      this.setParticipantCount(participantCount);
      this.setAnonymousParticipantCount(session.anonymous_participant_count || 0);
    };
    this.updateFromSessionParticipantCountUpdate = (event) => {
      const s = this.setCurrentValue(this.sessionSubject, (session) => {
        if (!session) return session;
        return __spreadProps(__spreadValues({}, session), {
          anonymous_participant_count: event.anonymous_participant_count,
          participants_count_by_role: event.participants_count_by_role
        });
      });
      this.updateParticipantCountFromSession(s);
    };
    this.updateFromSessionParticipantLeft = (event) => {
      const s = this.setCurrentValue(this.sessionSubject, (session) => {
        if (!session) return session;
        const {
          participants,
          participants_count_by_role
        } = session;
        const {
          user,
          user_session_id
        } = event.participant;
        return __spreadProps(__spreadValues({}, session), {
          participants: participants.filter((p) => p.user_session_id !== user_session_id),
          participants_count_by_role: __spreadProps(__spreadValues({}, participants_count_by_role), {
            [user.role]: Math.max(0, (participants_count_by_role[user.role] || 0) - 1)
          })
        });
      });
      this.updateParticipantCountFromSession(s);
    };
    this.updateFromSessionParticipantJoined = (event) => {
      const s = this.setCurrentValue(this.sessionSubject, (session) => {
        if (!session) return session;
        const {
          participants,
          participants_count_by_role
        } = session;
        const {
          user,
          user_session_id
        } = event.participant;
        let shouldInsertParticipant = true;
        const updatedParticipants = participants.map((p) => {
          if (p.user_session_id === user_session_id) {
            shouldInsertParticipant = false;
            return event.participant;
          }
          return p;
        });
        if (shouldInsertParticipant) {
          updatedParticipants.push(event.participant);
        }
        const increment = shouldInsertParticipant ? 1 : 0;
        return __spreadProps(__spreadValues({}, session), {
          participants: updatedParticipants,
          participants_count_by_role: __spreadProps(__spreadValues({}, participants_count_by_role), {
            [user.role]: (participants_count_by_role[user.role] || 0) + increment
          })
        });
      });
      this.updateParticipantCountFromSession(s);
    };
    this.updateMembers = (event) => {
      this.updateFromCallResponse(event.call);
      this.setCurrentValue(this.membersSubject, (members) => members.map((member) => {
        const memberUpdate = event.members.find((m) => m.user_id === member.user_id);
        return memberUpdate ? memberUpdate : member;
      }));
    };
    this.updateParticipantReaction = (event) => {
      const {
        user,
        custom,
        type,
        emoji_code
      } = event.reaction;
      this.setParticipants((participants) => {
        return participants.map((p) => {
          if (p.userId !== user.id) return p;
          return __spreadProps(__spreadValues({}, p), {
            reaction: {
              type,
              emoji_code,
              custom
            }
          });
        });
      });
    };
    this.unblockUser = (event) => {
      this.setCurrentValue(this.blockedUserIdsSubject, (current) => {
        if (!current) return current;
        return current.filter((id) => id !== event.user.id);
      });
    };
    this.blockUser = (event) => {
      this.setCurrentValue(this.blockedUserIdsSubject, (current) => [...current || [], event.user.id]);
    };
    this.updateOwnCapabilities = (event) => {
      if (event.user.id === this.localParticipant?.userId) {
        this.setCurrentValue(this.ownCapabilitiesSubject, event.own_capabilities);
      }
    };
    this.updateFromClosedCaptions = (event) => {
      this.setCurrentValue(this.closedCaptionsSubject, (queue) => {
        const {
          closed_caption
        } = event;
        const keyOf = (c) => `${c.speaker_id}/${c.start_time}`;
        const currentKey = keyOf(closed_caption);
        const duplicate = queue.some((caption) => keyOf(caption) === currentKey);
        if (duplicate) return queue;
        const nextQueue = [...queue, closed_caption];
        const {
          visibilityDurationMs = 2700,
          maxVisibleCaptions = 2
        } = this.closedCaptionsSettings || {};
        if (visibilityDurationMs > 0) {
          const taskId = setTimeout(() => {
            this.setCurrentValue(this.closedCaptionsSubject, (captions) => captions.filter((caption) => caption !== closed_caption));
            this.closedCaptionsTasks.delete(currentKey);
          }, visibilityDurationMs);
          this.closedCaptionsTasks.set(currentKey, taskId);
          for (let i = 0; i < nextQueue.length - maxVisibleCaptions; i++) {
            const key = keyOf(nextQueue[i]);
            const task = this.closedCaptionsTasks.get(key);
            clearTimeout(task);
            this.closedCaptionsTasks.delete(key);
          }
        }
        return nextQueue.slice(-maxVisibleCaptions);
      });
    };
    this.participants$ = this.participantsSubject.asObservable().pipe(
      // maintain stable-sort by mutating the participants stored
      // in the original subject
      map((ps) => ps.sort(this.sortParticipantsBy)),
      shareReplay({
        bufferSize: 1,
        refCount: true
      })
    );
    this.localParticipant$ = this.participants$.pipe(map((participants) => participants.find((p) => p.isLocalParticipant)), shareReplay({
      bufferSize: 1,
      refCount: true
    }));
    this.remoteParticipants$ = this.participants$.pipe(map((participants) => participants.filter((p) => !p.isLocalParticipant)), shareReplay({
      bufferSize: 1,
      refCount: true
    }));
    this.pinnedParticipants$ = this.participants$.pipe(map((participants) => participants.filter((p) => !!p.pin)), shareReplay({
      bufferSize: 1,
      refCount: true
    }));
    this.dominantSpeaker$ = this.participants$.pipe(map((participants) => participants.find((p) => p.isDominantSpeaker)), shareReplay({
      bufferSize: 1,
      refCount: true
    }));
    this.hasOngoingScreenShare$ = this.participants$.pipe(map((participants) => participants.some((p) => hasScreenShare(p))), distinctUntilChanged(), shareReplay({
      bufferSize: 1,
      refCount: true
    }));
    this.createdAt$ = this.createdAtSubject.asObservable();
    this.endedAt$ = this.endedAtSubject.asObservable();
    this.startsAt$ = this.startsAtSubject.asObservable();
    this.startedAt$ = this.startedAtSubject.asObservable();
    this.updatedAt$ = this.updatedAtSubject.asObservable();
    this.callStatsReport$ = this.callStatsReportSubject.asObservable();
    this.members$ = this.membersSubject.asObservable();
    this.createdBy$ = this.createdBySubject.asObservable();
    this.custom$ = this.customSubject.asObservable();
    this.egress$ = this.egressSubject.asObservable();
    this.ingress$ = this.ingressSubject.asObservable();
    this.session$ = this.sessionSubject.asObservable();
    this.settings$ = this.settingsSubject.asObservable();
    this.endedBy$ = this.endedBySubject.asObservable();
    this.thumbnails$ = this.thumbnailsSubject.asObservable();
    this.closedCaptions$ = this.closedCaptionsSubject.asObservable();
    const isShallowEqual = (a, b) => {
      if (a.length !== b.length) return false;
      for (const item of a) if (!b.includes(item)) return false;
      for (const item of b) if (!a.includes(item)) return false;
      return true;
    };
    const duc = (subject, comparator) => subject.asObservable().pipe(distinctUntilChanged(comparator));
    this.anonymousParticipantCount$ = duc(this.anonymousParticipantCountSubject);
    this.blockedUserIds$ = duc(this.blockedUserIdsSubject, isShallowEqual);
    this.backstage$ = duc(this.backstageSubject);
    this.callingState$ = duc(this.callingStateSubject);
    this.ownCapabilities$ = duc(this.ownCapabilitiesSubject, isShallowEqual);
    this.participantCount$ = duc(this.participantCountSubject);
    this.recording$ = duc(this.recordingSubject);
    this.transcribing$ = duc(this.transcribingSubject);
    this.captioning$ = duc(this.captioningSubject);
    this.eventHandlers = {
      // these events are not updating the call state:
      "call.frame_recording_ready": void 0,
      "call.permission_request": void 0,
      "call.recording_ready": void 0,
      "call.rtmp_broadcast_failed": void 0,
      "call.rtmp_broadcast_started": void 0,
      "call.rtmp_broadcast_stopped": void 0,
      "call.transcription_ready": void 0,
      "call.user_muted": void 0,
      "connection.error": void 0,
      "connection.ok": void 0,
      "health.check": void 0,
      "user.updated": void 0,
      custom: void 0,
      // events that update call state:
      "call.accepted": (e) => this.updateFromCallResponse(e.call),
      "call.blocked_user": this.blockUser,
      "call.closed_caption": this.updateFromClosedCaptions,
      "call.closed_captions_failed": () => {
        this.setCurrentValue(this.captioningSubject, false);
      },
      "call.closed_captions_started": () => {
        this.setCurrentValue(this.captioningSubject, true);
      },
      "call.closed_captions_stopped": () => {
        this.setCurrentValue(this.captioningSubject, false);
      },
      "call.created": (e) => this.updateFromCallResponse(e.call),
      "call.deleted": (e) => this.updateFromCallResponse(e.call),
      "call.ended": (e) => {
        this.updateFromCallResponse(e.call);
        this.setCurrentValue(this.endedBySubject, e.user);
      },
      "call.frame_recording_failed": (e) => {
        this.updateFromCallResponse(e.call);
      },
      "call.frame_recording_started": (e) => {
        this.updateFromCallResponse(e.call);
      },
      "call.frame_recording_stopped": (e) => {
        this.updateFromCallResponse(e.call);
      },
      "call.hls_broadcasting_failed": this.updateFromHLSBroadcastingFailed,
      "call.hls_broadcasting_started": (e) => {
        this.updateFromCallResponse(e.call);
      },
      "call.hls_broadcasting_stopped": this.updateFromHLSBroadcastStopped,
      "call.live_started": (e) => this.updateFromCallResponse(e.call),
      "call.member_added": this.updateFromMemberAdded,
      "call.member_removed": this.updateFromMemberRemoved,
      "call.member_updated_permission": this.updateMembers,
      "call.member_updated": this.updateMembers,
      "call.notification": (e) => {
        this.updateFromCallResponse(e.call);
        this.setMembers(e.members);
      },
      "call.permissions_updated": this.updateOwnCapabilities,
      "call.reaction_new": this.updateParticipantReaction,
      "call.recording_started": () => this.setCurrentValue(this.recordingSubject, true),
      "call.recording_stopped": () => this.setCurrentValue(this.recordingSubject, false),
      "call.recording_failed": () => this.setCurrentValue(this.recordingSubject, false),
      "call.rejected": (e) => this.updateFromCallResponse(e.call),
      "call.ring": (e) => this.updateFromCallResponse(e.call),
      "call.missed": (e) => this.updateFromCallResponse(e.call),
      "call.session_ended": (e) => this.updateFromCallResponse(e.call),
      "call.session_participant_count_updated": this.updateFromSessionParticipantCountUpdate,
      "call.session_participant_joined": this.updateFromSessionParticipantJoined,
      "call.session_participant_left": this.updateFromSessionParticipantLeft,
      "call.session_started": (e) => this.updateFromCallResponse(e.call),
      "call.transcription_started": () => {
        this.setCurrentValue(this.transcribingSubject, true);
      },
      "call.transcription_stopped": () => {
        this.setCurrentValue(this.transcribingSubject, false);
      },
      "call.transcription_failed": () => {
        this.setCurrentValue(this.transcribingSubject, false);
      },
      "call.unblocked_user": this.unblockUser,
      "call.updated": (e) => this.updateFromCallResponse(e.call)
    };
  }
  /**
   * The server-side counted number of participants connected to the current call.
   * This number includes the anonymous participants as well.
   */
  get participantCount() {
    return this.getCurrentValue(this.participantCount$);
  }
  /**
   * The time the call session actually started.
   * Useful for displaying the call duration.
   */
  get startedAt() {
    return this.getCurrentValue(this.startedAt$);
  }
  /**
   * Returns whether closed captions are enabled in the current call.
   */
  get captioning() {
    return this.getCurrentValue(this.captioning$);
  }
  /**
   * The server-side counted number of anonymous participants connected to the current call.
   * This number includes the anonymous participants as well.
   */
  get anonymousParticipantCount() {
    return this.getCurrentValue(this.anonymousParticipantCount$);
  }
  /**
   * The list of participants in the current call.
   */
  get participants() {
    return this.getCurrentValue(this.participants$);
  }
  /**
   * The local participant in the current call.
   */
  get localParticipant() {
    return this.getCurrentValue(this.localParticipant$);
  }
  /**
   * The list of remote participants in the current call.
   */
  get remoteParticipants() {
    return this.getCurrentValue(this.remoteParticipants$);
  }
  /**
   * The dominant speaker in the current call.
   */
  get dominantSpeaker() {
    return this.getCurrentValue(this.dominantSpeaker$);
  }
  /**
   * The list of pinned participants in the current call.
   */
  get pinnedParticipants() {
    return this.getCurrentValue(this.pinnedParticipants$);
  }
  /**
   * Tell if there is an ongoing screen share in this call.
   */
  get hasOngoingScreenShare() {
    return this.getCurrentValue(this.hasOngoingScreenShare$);
  }
  /**
   * The calling state.
   */
  get callingState() {
    return this.getCurrentValue(this.callingState$);
  }
  /**
   * The call stats report.
   */
  get callStatsReport() {
    return this.getCurrentValue(this.callStatsReport$);
  }
  /**
   * The members of the current call.
   */
  get members() {
    return this.getCurrentValue(this.members$);
  }
  /**
   * The capabilities of the current user for the current call.
   */
  get ownCapabilities() {
    return this.getCurrentValue(this.ownCapabilities$);
  }
  /**
   * The backstage state.
   */
  get backstage() {
    return this.getCurrentValue(this.backstage$);
  }
  /**
   * Will provide the list of blocked user IDs.
   */
  get blockedUserIds() {
    return this.getCurrentValue(this.blockedUserIds$);
  }
  /**
   * Will provide the time when this call has been created.
   */
  get createdAt() {
    return this.getCurrentValue(this.createdAt$);
  }
  /**
   * Will provide the time when this call has been ended.
   */
  get endedAt() {
    return this.getCurrentValue(this.endedAt$);
  }
  /**
   * Will provide the time when this call has been scheduled to start.
   */
  get startsAt() {
    return this.getCurrentValue(this.startsAt$);
  }
  /**
   * Will provide the time when this call has been updated.
   */
  get updatedAt() {
    return this.getCurrentValue(this.updatedAt$);
  }
  /**
   * Will provide the user who created this call.
   */
  get createdBy() {
    return this.getCurrentValue(this.createdBy$);
  }
  /**
   * Will provide the custom data of this call.
   */
  get custom() {
    return this.getCurrentValue(this.custom$);
  }
  /**
   * Will provide the egress data of this call.
   */
  get egress() {
    return this.getCurrentValue(this.egress$);
  }
  /**
   * Will provide the ingress data of this call.
   */
  get ingress() {
    return this.getCurrentValue(this.ingress$);
  }
  /**
   * Will provide the recording state of this call.
   */
  get recording() {
    return this.getCurrentValue(this.recording$);
  }
  /**
   * Will provide the session data of this call.
   */
  get session() {
    return this.getCurrentValue(this.session$);
  }
  /**
   * Will provide the settings of this call.
   */
  get settings() {
    return this.getCurrentValue(this.settings$);
  }
  /**
   * Will provide the transcribing state of this call.
   */
  get transcribing() {
    return this.getCurrentValue(this.transcribing$);
  }
  /**
   * Will provide the user who ended this call.
   */
  get endedBy() {
    return this.getCurrentValue(this.endedBy$);
  }
  /**
   * Will provide the thumbnails of this call, if enabled in the call settings.
   */
  get thumbnails() {
    return this.getCurrentValue(this.thumbnails$);
  }
  /**
   * Returns the current queue of closed captions.
   */
  get closedCaptions() {
    return this.getCurrentValue(this.closedCaptions$);
  }
};
var flatten = (report) => {
  const stats = [];
  report.forEach((s) => {
    stats.push(s);
  });
  return stats;
};
var getSdkSignature = (clientDetails) => {
  const _a = clientDetails, {
    sdk
  } = _a, platform = __objRest(_a, [
    "sdk"
  ]);
  const sdkName = getSdkName(sdk);
  const sdkVersion = getSdkVersion(sdk);
  return __spreadValues({
    sdkName,
    sdkVersion
  }, platform);
};
var getSdkName = (sdk) => {
  return sdk && sdk.type === SdkType.REACT ? "stream-react" : sdk && sdk.type === SdkType.REACT_NATIVE ? "stream-react-native" : "stream-js";
};
var getSdkVersion = (sdk) => {
  return sdk ? `${sdk.major}.${sdk.minor}.${sdk.patch}` : "0.0.0-development";
};
var isSafari = () => {
  if (typeof navigator === "undefined") return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent || "");
};
var isFirefox = () => {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent?.includes("Firefox");
};
var isChrome = () => {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent?.includes("Chrome");
};
var browsers = Object.freeze({
  __proto__: null,
  isChrome,
  isFirefox,
  isSafari
});
var createStatsReporter = ({
  subscriber,
  publisher,
  state,
  datacenter,
  pollingIntervalInMs = 2e3
}) => {
  const logger2 = getLogger(["stats"]);
  const getRawStatsForTrack = (kind, selector) => __async(void 0, null, function* () {
    if (kind === "subscriber" && subscriber) {
      return subscriber.getStats(selector);
    } else if (kind === "publisher" && publisher) {
      return publisher.getStats(selector);
    } else {
      return void 0;
    }
  });
  const getStatsForStream = (kind, tracks) => __async(void 0, null, function* () {
    const pc = kind === "subscriber" ? subscriber : publisher;
    if (!pc) return [];
    const statsForStream = [];
    for (const track of tracks) {
      const report = yield pc.getStats(track);
      const stats = transform(report, {
        trackKind: track.kind,
        kind,
        publisher: void 0
      });
      statsForStream.push(stats);
    }
    return statsForStream;
  });
  const startReportingStatsFor = (sessionId) => {
    sessionIdsToTrack.add(sessionId);
    void run();
  };
  const stopReportingStatsFor = (sessionId) => {
    sessionIdsToTrack.delete(sessionId);
    void run();
  };
  const sessionIdsToTrack = /* @__PURE__ */ new Set();
  const run = () => __async(void 0, null, function* () {
    const participantStats = {};
    if (sessionIdsToTrack.size > 0) {
      const sessionIds = new Set(sessionIdsToTrack);
      for (const participant of state.participants) {
        if (!sessionIds.has(participant.sessionId)) continue;
        const {
          audioStream,
          isLocalParticipant,
          sessionId,
          userId,
          videoStream
        } = participant;
        const kind = isLocalParticipant ? "publisher" : "subscriber";
        try {
          const tracks = isLocalParticipant ? publisher?.getPublishedTracks() || [] : [...videoStream?.getVideoTracks() || [], ...audioStream?.getAudioTracks() || []];
          participantStats[sessionId] = yield getStatsForStream(kind, tracks);
        } catch (e) {
          logger2("warn", `Failed to collect ${kind} stats for ${userId}`, e);
        }
      }
    }
    const [subscriberRawStats, publisherRawStats] = yield Promise.all([getRawStatsForTrack("subscriber"), publisher ? getRawStatsForTrack("publisher") : void 0]);
    const process = (report, kind) => aggregate(transform(report, {
      kind,
      trackKind: "video",
      publisher
    }));
    const subscriberStats = subscriberRawStats ? process(subscriberRawStats, "subscriber") : getEmptyStats();
    const publisherStats = publisherRawStats ? process(publisherRawStats, "publisher") : getEmptyStats();
    state.setCallStatsReport({
      datacenter,
      publisherStats,
      subscriberStats,
      subscriberRawStats,
      publisherRawStats,
      participants: participantStats,
      timestamp: Date.now()
    });
  });
  let timeoutId;
  if (pollingIntervalInMs > 0) {
    const loop = () => __async(void 0, null, function* () {
      yield run().catch((e) => {
        logger2("debug", "Failed to collect stats", e);
      });
      timeoutId = setTimeout(loop, pollingIntervalInMs);
    });
    void loop();
  }
  const stop = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
  return {
    getRawStatsForTrack,
    getStatsForStream,
    startReportingStatsFor,
    stopReportingStatsFor,
    stop
  };
};
var transform = (report, opts) => {
  const {
    trackKind,
    kind,
    publisher
  } = opts;
  const direction = kind === "subscriber" ? "inbound-rtp" : "outbound-rtp";
  const stats = flatten(report);
  const streams = stats.filter((stat) => stat.type === direction && stat.kind === trackKind).map((stat) => {
    const rtcStreamStats = stat;
    const codec = stats.find((s) => s.type === "codec" && s.id === rtcStreamStats.codecId);
    const transport = stats.find((s) => s.type === "transport" && s.id === rtcStreamStats.transportId);
    let roundTripTime;
    if (transport && transport.dtlsState === "connected") {
      const candidatePair = stats.find((s) => s.type === "candidate-pair" && s.id === transport.selectedCandidatePairId);
      roundTripTime = candidatePair?.currentRoundTripTime;
    }
    let trackType;
    if (kind === "publisher" && publisher) {
      const firefox = isFirefox();
      const mediaSource = stats.find((s) => s.type === "media-source" && // Firefox doesn't have mediaSourceId, so we need to guess the media source
      (firefox ? true : s.id === rtcStreamStats.mediaSourceId));
      if (mediaSource) {
        trackType = publisher.getTrackType(mediaSource.trackIdentifier);
      }
    }
    return {
      bytesSent: rtcStreamStats.bytesSent,
      bytesReceived: rtcStreamStats.bytesReceived,
      codec: codec?.mimeType,
      currentRoundTripTime: roundTripTime,
      frameHeight: rtcStreamStats.frameHeight,
      frameWidth: rtcStreamStats.frameWidth,
      framesPerSecond: rtcStreamStats.framesPerSecond,
      jitter: rtcStreamStats.jitter,
      kind: rtcStreamStats.kind,
      mediaSourceId: rtcStreamStats.mediaSourceId,
      qualityLimitationReason: rtcStreamStats.qualityLimitationReason,
      rid: rtcStreamStats.rid,
      ssrc: rtcStreamStats.ssrc,
      trackType
    };
  });
  return {
    rawStats: report,
    streams,
    timestamp: Date.now()
  };
};
var getEmptyStats = (stats) => {
  return {
    rawReport: stats ?? {
      streams: [],
      timestamp: Date.now()
    },
    totalBytesSent: 0,
    totalBytesReceived: 0,
    averageJitterInMs: 0,
    averageRoundTripTimeInMs: 0,
    qualityLimitationReasons: "none",
    highestFrameWidth: 0,
    highestFrameHeight: 0,
    highestFramesPerSecond: 0,
    codec: "",
    codecPerTrackType: {},
    timestamp: Date.now()
  };
};
var aggregate = (stats) => {
  const aggregatedStats = getEmptyStats(stats);
  let maxArea = -1;
  const area = (w, h) => w * h;
  const qualityLimitationReasons = /* @__PURE__ */ new Set();
  const streams = stats.streams;
  const report = streams.reduce((acc, stream) => {
    acc.totalBytesSent += stream.bytesSent || 0;
    acc.totalBytesReceived += stream.bytesReceived || 0;
    acc.averageJitterInMs += stream.jitter || 0;
    acc.averageRoundTripTimeInMs += stream.currentRoundTripTime || 0;
    const streamArea = area(stream.frameWidth || 0, stream.frameHeight || 0);
    if (streamArea > maxArea) {
      acc.highestFrameWidth = stream.frameWidth || 0;
      acc.highestFrameHeight = stream.frameHeight || 0;
      acc.highestFramesPerSecond = stream.framesPerSecond || 0;
      maxArea = streamArea;
    }
    qualityLimitationReasons.add(stream.qualityLimitationReason || "");
    return acc;
  }, aggregatedStats);
  if (streams.length > 0) {
    report.averageJitterInMs = Math.round(report.averageJitterInMs / streams.length * 1e3);
    report.averageRoundTripTimeInMs = Math.round(report.averageRoundTripTimeInMs / streams.length * 1e3);
    report.codec = streams[0].codec || "";
    report.codecPerTrackType = streams.reduce((acc, stream) => {
      if (stream.trackType) {
        acc[stream.trackType] = stream.codec || "";
      }
      return acc;
    }, {});
  }
  const qualityLimitationReason = [qualityLimitationReasons.has("cpu") && "cpu", qualityLimitationReasons.has("bandwidth") && "bandwidth", qualityLimitationReasons.has("other") && "other"].filter(Boolean).join(", ");
  if (qualityLimitationReason) {
    report.qualityLimitationReasons = qualityLimitationReason;
  }
  return report;
};
var version = "1.21.0";
var [major, minor, patch] = version.split(".");
var sdkInfo = {
  type: SdkType.PLAIN_JAVASCRIPT,
  major,
  minor,
  patch
};
var osInfo;
var deviceInfo;
var webRtcInfo;
var deviceState = {
  oneofKind: void 0
};
var setSdkInfo = (info) => {
  sdkInfo = info;
};
var getSdkInfo = () => {
  return sdkInfo;
};
var setOSInfo = (info) => {
  osInfo = info;
};
var setDeviceInfo = (info) => {
  deviceInfo = info;
};
var getWebRTCInfo = () => {
  return webRtcInfo;
};
var setWebRTCInfo = (info) => {
  webRtcInfo = info;
};
var setThermalState = (state) => {
  if (!osInfo) {
    deviceState = {
      oneofKind: void 0
    };
    return;
  }
  if (osInfo.name === "android") {
    const thermalState = AndroidThermalState[state] || AndroidThermalState.UNSPECIFIED;
    deviceState = {
      oneofKind: "android",
      android: {
        thermalState,
        isPowerSaverMode: deviceState?.oneofKind === "android" && deviceState.android.isPowerSaverMode
      }
    };
  }
  if (osInfo.name.toLowerCase() === "ios") {
    const thermalState = AppleThermalState[state] || AppleThermalState.UNSPECIFIED;
    deviceState = {
      oneofKind: "apple",
      apple: {
        thermalState,
        isLowPowerModeEnabled: deviceState?.oneofKind === "apple" && deviceState.apple.isLowPowerModeEnabled
      }
    };
  }
};
var setPowerState = (powerMode) => {
  if (!osInfo) {
    deviceState = {
      oneofKind: void 0
    };
    return;
  }
  if (osInfo.name === "android") {
    deviceState = {
      oneofKind: "android",
      android: {
        thermalState: deviceState?.oneofKind === "android" ? deviceState.android.thermalState : AndroidThermalState.UNSPECIFIED,
        isPowerSaverMode: powerMode
      }
    };
  }
  if (osInfo.name.toLowerCase() === "ios") {
    deviceState = {
      oneofKind: "apple",
      apple: {
        thermalState: deviceState?.oneofKind === "apple" ? deviceState.apple.thermalState : AppleThermalState.UNSPECIFIED,
        isLowPowerModeEnabled: powerMode
      }
    };
  }
};
var getDeviceState = () => {
  return deviceState;
};
var getClientDetails = () => __async(void 0, null, function* () {
  if (isReactNative()) {
    return {
      sdk: sdkInfo,
      os: osInfo,
      device: deviceInfo
    };
  }
  const userAgentDataApi = navigator.userAgentData;
  let userAgentData;
  if (userAgentDataApi && userAgentDataApi.getHighEntropyValues) {
    try {
      userAgentData = yield userAgentDataApi.getHighEntropyValues(["platform", "platformVersion"]);
    } catch {
    }
  }
  const userAgent = new import_ua_parser_js.UAParser(navigator.userAgent);
  const {
    browser,
    os,
    device,
    cpu
  } = userAgent.getResult();
  return {
    sdk: sdkInfo,
    browser: {
      name: browser.name || navigator.userAgent,
      version: browser.version || ""
    },
    os: {
      name: userAgentData?.platform || os.name || "",
      version: userAgentData?.platformVersion || os.version || "",
      architecture: cpu.architecture || ""
    },
    device: {
      name: [device.vendor, device.model, device.type].filter(Boolean).join(" "),
      version: ""
    }
  };
});
var SfuStatsReporter = class {
  constructor(sfuClient, {
    options,
    clientDetails,
    subscriber,
    publisher,
    microphone,
    camera,
    state,
    unifiedSessionId
  }) {
    this.logger = getLogger(["SfuStatsReporter"]);
    this.inputDevices = /* @__PURE__ */ new Map();
    this.observeDevice = (device, kind) => {
      const {
        browserPermissionState$
      } = device.state;
      this.unsubscribeDevicePermissionsSubscription?.();
      this.unsubscribeDevicePermissionsSubscription = createSubscription(combineLatest([browserPermissionState$, this.state.ownCapabilities$]), ([browserPermissionState, ownCapabilities]) => {
        this.unsubscribeListDevicesSubscription?.();
        const hasCapability = kind === "mic" ? ownCapabilities.includes(OwnCapability.SEND_AUDIO) : ownCapabilities.includes(OwnCapability.SEND_VIDEO);
        if (browserPermissionState !== "granted" || !hasCapability) {
          this.inputDevices.set(kind, {
            currentDevice: "",
            availableDevices: [],
            isPermitted: false
          });
          return;
        }
        this.unsubscribeListDevicesSubscription = createSubscription(combineLatest([device.listDevices(), device.state.selectedDevice$]), ([devices, deviceId]) => {
          const selected = devices.find((d) => d.deviceId === deviceId);
          this.inputDevices.set(kind, {
            currentDevice: selected?.label || deviceId || "",
            availableDevices: devices.map((d) => d.label),
            isPermitted: true
          });
        });
      });
    };
    this.sendConnectionTime = (connectionTimeSeconds) => {
      this.sendTelemetryData({
        data: {
          oneofKind: "connectionTimeSeconds",
          connectionTimeSeconds
        }
      });
    };
    this.sendReconnectionTime = (strategy, timeSeconds) => {
      this.sendTelemetryData({
        data: {
          oneofKind: "reconnection",
          reconnection: {
            strategy,
            timeSeconds
          }
        }
      });
    };
    this.sendTelemetryData = (telemetryData) => {
      this.run(telemetryData).catch((err) => {
        this.logger("warn", "Failed to send telemetry data", err);
      });
    };
    this.run = (telemetry) => __async(this, null, function* () {
      const [subscriberStats, publisherStats] = yield Promise.all([this.subscriber.stats.get(), this.publisher?.stats.get()]);
      this.subscriber.tracer?.trace("getstats", subscriberStats.delta);
      if (publisherStats) {
        this.publisher?.tracer?.trace("getstats", publisherStats.delta);
      }
      const subscriberTrace = this.subscriber.tracer?.take();
      const publisherTrace = this.publisher?.tracer?.take();
      const mediaTrace = tracer.take();
      const sfuTrace = this.sfuClient.getTrace();
      const traces = [...mediaTrace.snapshot, ...sfuTrace?.snapshot ?? [], ...publisherTrace?.snapshot ?? [], ...subscriberTrace?.snapshot ?? []];
      try {
        yield this.sfuClient.sendStats({
          sdk: this.sdkName,
          sdkVersion: this.sdkVersion,
          webrtcVersion: this.webRTCVersion,
          subscriberStats: JSON.stringify(flatten(subscriberStats.stats)),
          publisherStats: publisherStats ? JSON.stringify(flatten(publisherStats.stats)) : "[]",
          subscriberRtcStats: "",
          publisherRtcStats: "",
          rtcStats: JSON.stringify(traces),
          encodeStats: publisherStats?.performanceStats ?? [],
          decodeStats: subscriberStats.performanceStats,
          audioDevices: this.inputDevices.get("mic"),
          videoDevices: this.inputDevices.get("camera"),
          unifiedSessionId: this.unifiedSessionId,
          deviceState: getDeviceState(),
          telemetry
        });
      } catch (err) {
        publisherTrace?.rollback();
        subscriberTrace?.rollback();
        mediaTrace.rollback();
        sfuTrace?.rollback();
        throw err;
      }
    });
    this.start = () => {
      if (this.options.reporting_interval_ms <= 0) return;
      this.observeDevice(this.microphone, "mic");
      this.observeDevice(this.camera, "camera");
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.run().catch((err) => {
          this.logger("warn", "Failed to report stats", err);
        });
      }, this.options.reporting_interval_ms);
    };
    this.stop = () => {
      this.unsubscribeDevicePermissionsSubscription?.();
      this.unsubscribeDevicePermissionsSubscription = void 0;
      this.unsubscribeListDevicesSubscription?.();
      this.unsubscribeListDevicesSubscription = void 0;
      this.inputDevices.clear();
      clearInterval(this.intervalId);
      this.intervalId = void 0;
      clearTimeout(this.timeoutId);
      this.timeoutId = void 0;
    };
    this.scheduleOne = (timeout) => {
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => {
        this.run().catch((err) => {
          this.logger("warn", "Failed to report stats", err);
        });
      }, timeout);
    };
    this.sfuClient = sfuClient;
    this.options = options;
    this.subscriber = subscriber;
    this.publisher = publisher;
    this.microphone = microphone;
    this.camera = camera;
    this.state = state;
    this.unifiedSessionId = unifiedSessionId;
    const {
      sdk,
      browser
    } = clientDetails;
    this.sdkName = getSdkName(sdk);
    this.sdkVersion = getSdkVersion(sdk);
    const webRTCInfo = getWebRTCInfo();
    this.webRTCVersion = webRTCInfo?.version || `${browser?.name || ""}-${browser?.version || ""}` || "N/A";
  }
};
var traceRTCPeerConnection = (pc, trace) => {
  pc.addEventListener("icecandidate", (e) => {
    trace("onicecandidate", e.candidate);
  });
  pc.addEventListener("track", (e) => {
    const streams = e.streams.map((stream) => `stream:${stream.id}`);
    trace("ontrack", `${e.track.kind}:${e.track.id} ${streams}`);
  });
  pc.addEventListener("signalingstatechange", () => {
    trace("signalingstatechange", pc.signalingState);
  });
  pc.addEventListener("iceconnectionstatechange", () => {
    trace("iceconnectionstatechange", pc.iceConnectionState);
  });
  pc.addEventListener("icegatheringstatechange", () => {
    trace("icegatheringstatechange", pc.iceGatheringState);
  });
  pc.addEventListener("connectionstatechange", () => {
    trace("connectionstatechange", pc.connectionState);
  });
  pc.addEventListener("negotiationneeded", () => {
    trace("negotiationneeded", void 0);
  });
  pc.addEventListener("datachannel", ({
    channel
  }) => {
    trace("datachannel", [channel.id, channel.label]);
  });
  const origClose = pc.close;
  pc.close = function tracedClose() {
    trace("close", void 0);
    return origClose.call(this);
  };
  for (const method of ["createOffer", "createAnswer", "setLocalDescription", "setRemoteDescription", "addIceCandidate"]) {
    const original = pc[method];
    if (!original) continue;
    pc[method] = function tracedMethod(...args) {
      return __async(this, null, function* () {
        try {
          trace(method, args);
          const result = yield original.apply(this, args);
          trace(`${method}OnSuccess`, result);
          return result;
        } catch (err) {
          trace(`${method}OnFailure`, err.toString());
          throw err;
        }
      });
    };
  }
};
var StatsTracer = class {
  /**
   * Creates a new StatsTracer instance.
   */
  constructor(pc, peerType, trackIdToTrackType) {
    this.previousStats = {};
    this.frameTimeHistory = [];
    this.fpsHistory = [];
    this.get = () => __async(this, null, function* () {
      const stats = yield this.pc.getStats();
      const currentStats = toObject(stats);
      const performanceStats = this.withOverrides(this.peerType === PeerType.SUBSCRIBER ? this.getDecodeStats(currentStats) : this.getEncodeStats(currentStats));
      const delta = deltaCompression(this.previousStats, currentStats);
      this.previousStats = currentStats;
      this.frameTimeHistory = this.frameTimeHistory.slice(-2);
      this.fpsHistory = this.fpsHistory.slice(-2);
      return {
        performanceStats,
        delta,
        stats
      };
    });
    this.getEncodeStats = (currentStats) => {
      const encodeStats = [];
      for (const rtp of Object.values(currentStats)) {
        if (rtp.type !== "outbound-rtp") continue;
        const {
          codecId,
          framesSent = 0,
          kind,
          id,
          totalEncodeTime = 0,
          framesPerSecond = 0,
          frameHeight = 0,
          frameWidth = 0,
          targetBitrate = 0,
          mediaSourceId
        } = rtp;
        if (kind === "audio" || !this.previousStats[id]) continue;
        const prevRtp = this.previousStats[id];
        const deltaTotalEncodeTime = totalEncodeTime - (prevRtp.totalEncodeTime || 0);
        const deltaFramesSent = framesSent - (prevRtp.framesSent || 0);
        const framesEncodeTime = deltaFramesSent > 0 ? deltaTotalEncodeTime / deltaFramesSent * 1e3 : 0;
        this.frameTimeHistory.push(framesEncodeTime);
        this.fpsHistory.push(framesPerSecond);
        let trackType = TrackType.VIDEO;
        if (mediaSourceId && currentStats[mediaSourceId]) {
          const mediaSource = currentStats[mediaSourceId];
          trackType = this.trackIdToTrackType.get(mediaSource.trackIdentifier) || trackType;
        }
        encodeStats.push({
          trackType,
          codec: getCodecFromStats(currentStats, codecId),
          avgFrameTimeMs: average(this.frameTimeHistory),
          avgFps: average(this.fpsHistory),
          targetBitrate: Math.round(targetBitrate),
          videoDimension: {
            width: frameWidth,
            height: frameHeight
          }
        });
      }
      return encodeStats;
    };
    this.getDecodeStats = (currentStats) => {
      let rtp = void 0;
      let max = 0;
      for (const item of Object.values(currentStats)) {
        if (item.type !== "inbound-rtp") continue;
        const rtpItem = item;
        const {
          kind,
          frameWidth = 0,
          frameHeight = 0
        } = rtpItem;
        const area = frameWidth * frameHeight;
        if (kind === "video" && area > max) {
          rtp = rtpItem;
          max = area;
        }
      }
      if (!rtp || !this.previousStats[rtp.id]) return [];
      const prevRtp = this.previousStats[rtp.id];
      const {
        framesDecoded = 0,
        framesPerSecond = 0,
        totalDecodeTime = 0,
        trackIdentifier
      } = rtp;
      const deltaTotalDecodeTime = totalDecodeTime - (prevRtp.totalDecodeTime || 0);
      const deltaFramesDecoded = framesDecoded - (prevRtp.framesDecoded || 0);
      const framesDecodeTime = deltaFramesDecoded > 0 ? deltaTotalDecodeTime / deltaFramesDecoded * 1e3 : 0;
      this.frameTimeHistory.push(framesDecodeTime);
      this.fpsHistory.push(framesPerSecond);
      const trackType = this.trackIdToTrackType.get(trackIdentifier) || TrackType.VIDEO;
      return [PerformanceStats.create({
        trackType,
        codec: getCodecFromStats(currentStats, rtp.codecId),
        avgFrameTimeMs: average(this.frameTimeHistory),
        avgFps: average(this.fpsHistory),
        videoDimension: {
          width: rtp.frameWidth,
          height: rtp.frameHeight
        }
      })];
    };
    this.withOverrides = (performanceStats) => {
      if (this.costOverrides) {
        for (const s of performanceStats) {
          const override = this.costOverrides.get(s.trackType);
          if (override !== void 0) {
            s.avgFrameTimeMs = override + (s.avgFrameTimeMs || 0) / 1e3;
          }
        }
      }
      return performanceStats;
    };
    this.setCost = (cost, trackType = TrackType.VIDEO) => {
      if (!this.costOverrides) this.costOverrides = /* @__PURE__ */ new Map();
      this.costOverrides.set(trackType, cost);
    };
    this.pc = pc;
    this.peerType = peerType;
    this.trackIdToTrackType = trackIdToTrackType;
  }
};
var toObject = (report) => {
  const obj = {};
  report.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
};
var deltaCompression = (oldStats, newStats) => {
  newStats = JSON.parse(JSON.stringify(newStats));
  for (const [id, report] of Object.entries(newStats)) {
    delete report.id;
    if (!oldStats[id]) continue;
    for (const [name2, value] of Object.entries(report)) {
      if (value === oldStats[id][name2]) {
        delete report[name2];
      }
    }
  }
  let timestamp = -Infinity;
  const values = Object.values(newStats);
  for (const report of values) {
    if (report.timestamp > timestamp) {
      timestamp = report.timestamp;
    }
  }
  for (const report of values) {
    if (report.timestamp === timestamp) {
      report.timestamp = 0;
    }
  }
  newStats.timestamp = timestamp;
  return newStats;
};
var average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
var getCodecFromStats = (stats, codecId) => {
  if (!codecId || !stats[codecId]) return;
  const codecStats = stats[codecId];
  return Codec.create({
    name: codecStats.mimeType.split("/").pop(),
    // video/av1 -> av1
    clockRate: codecStats.clockRate,
    payloadType: codecStats.payloadType,
    fmtp: codecStats.sdpFmtpLine
  });
};
var BasePeerConnection = class {
  /**
   * Constructs a new `BasePeerConnection` instance.
   */
  constructor(peerType, {
    sfuClient,
    connectionConfig,
    state,
    dispatcher,
    onUnrecoverableError,
    logTag,
    enableTracing
  }) {
    this.isIceRestarting = false;
    this.isDisposed = false;
    this.trackIdToTrackType = /* @__PURE__ */ new Map();
    this.subscriptions = [];
    this.on = (event, fn) => {
      this.subscriptions.push(this.dispatcher.on(event, (e) => {
        withoutConcurrency(`pc.${event}`, () => __async(this, null, function* () {
          return fn(e);
        })).catch((err) => {
          if (this.isDisposed) return;
          this.logger("warn", `Error handling ${event}`, err);
        });
      }));
    };
    this.addTrickledIceCandidates = () => {
      const {
        iceTrickleBuffer
      } = this.sfuClient;
      const observable = this.peerType === PeerType.SUBSCRIBER ? iceTrickleBuffer.subscriberCandidates : iceTrickleBuffer.publisherCandidates;
      this.unsubscribeIceTrickle?.();
      this.unsubscribeIceTrickle = createSafeAsyncSubscription(observable, (candidate) => __async(this, null, function* () {
        return this.pc.addIceCandidate(candidate).catch((e) => {
          if (this.isDisposed) return;
          this.logger("warn", `ICE candidate error`, e, candidate);
        });
      }));
    };
    this.setSfuClient = (sfuClient2) => {
      this.sfuClient = sfuClient2;
    };
    this.getStats = (selector) => {
      return this.pc.getStats(selector);
    };
    this.getTrackType = (trackId) => {
      return this.trackIdToTrackType.get(trackId);
    };
    this.onIceCandidate = (e) => {
      const {
        candidate
      } = e;
      if (!candidate) {
        this.logger("debug", "null ice candidate");
        return;
      }
      const iceCandidate = this.asJSON(candidate);
      this.sfuClient.iceTrickle({
        peerType: this.peerType,
        iceCandidate
      }).catch((err) => {
        if (this.isDisposed) return;
        this.logger("warn", `ICETrickle failed`, err);
      });
    };
    this.asJSON = (candidate) => {
      if (!candidate.usernameFragment) {
        const segments = candidate.candidate.split(" ");
        const ufragIndex = segments.findIndex((s) => s === "ufrag") + 1;
        const usernameFragment = segments[ufragIndex];
        return JSON.stringify(__spreadProps(__spreadValues({}, candidate), {
          usernameFragment
        }));
      }
      return JSON.stringify(candidate.toJSON());
    };
    this.onConnectionStateChange = () => __async(this, null, function* () {
      const state2 = this.pc.connectionState;
      this.logger("debug", `Connection state changed`, state2);
      if (!this.tracer) return;
      if (state2 === "connected" || state2 === "failed") {
        try {
          const stats = yield this.stats.get();
          this.tracer.trace("getstats", stats.delta);
        } catch (err) {
          this.tracer.trace("getstatsOnFailure", err.toString());
        }
      }
    });
    this.onIceConnectionStateChange = () => {
      const state2 = this.pc.iceConnectionState;
      this.logger("debug", `ICE connection state changed`, state2);
      if (this.state.callingState === CallingState.OFFLINE) return;
      if (this.state.callingState === CallingState.RECONNECTING) return;
      if (this.isIceRestarting) return;
      if (state2 === "failed" || state2 === "disconnected") {
        this.logger("debug", `Attempting to restart ICE`);
        this.restartIce().catch((e) => {
          if (this.isDisposed) return;
          const reason = `ICE restart failed`;
          this.logger("error", reason, e);
          this.onUnrecoverableError?.(`${reason}: ${e}`);
        });
      }
    };
    this.onIceCandidateError = (e) => {
      const errorMessage = e instanceof RTCPeerConnectionIceErrorEvent && `${e.errorCode}: ${e.errorText}`;
      const iceState = this.pc.iceConnectionState;
      const logLevel = iceState === "connected" || iceState === "checking" ? "debug" : "warn";
      this.logger(logLevel, `ICE Candidate error`, errorMessage);
    };
    this.onIceGatherChange = () => {
      this.logger("debug", `ICE Gathering State`, this.pc.iceGatheringState);
    };
    this.onSignalingChange = () => {
      this.logger("debug", `Signaling state changed`, this.pc.signalingState);
    };
    this.peerType = peerType;
    this.sfuClient = sfuClient;
    this.state = state;
    this.dispatcher = dispatcher;
    this.onUnrecoverableError = onUnrecoverableError;
    this.logger = getLogger([peerType === PeerType.SUBSCRIBER ? "Subscriber" : "Publisher", logTag]);
    this.pc = new RTCPeerConnection(connectionConfig);
    this.pc.addEventListener("icecandidate", this.onIceCandidate);
    this.pc.addEventListener("icecandidateerror", this.onIceCandidateError);
    this.pc.addEventListener("iceconnectionstatechange", this.onIceConnectionStateChange);
    this.pc.addEventListener("icegatheringstatechange", this.onIceGatherChange);
    this.pc.addEventListener("signalingstatechange", this.onSignalingChange);
    this.pc.addEventListener("connectionstatechange", this.onConnectionStateChange);
    this.stats = new StatsTracer(this.pc, peerType, this.trackIdToTrackType);
    if (enableTracing) {
      const tag = `${logTag}-${peerType === PeerType.SUBSCRIBER ? "sub" : "pub"}-${sfuClient.edgeName}`;
      this.tracer = new Tracer(tag);
      this.tracer.trace("create", connectionConfig);
      traceRTCPeerConnection(this.pc, this.tracer.trace);
    }
  }
  /**
   * Disposes the `RTCPeerConnection` instance.
   */
  dispose() {
    this.onUnrecoverableError = void 0;
    this.isDisposed = true;
    this.detachEventHandlers();
    this.pc.close();
    this.tracer?.dispose();
  }
  /**
   * Detaches the event handlers from the `RTCPeerConnection`.
   */
  detachEventHandlers() {
    this.pc.removeEventListener("icecandidate", this.onIceCandidate);
    this.pc.removeEventListener("icecandidateerror", this.onIceCandidateError);
    this.pc.removeEventListener("signalingstatechange", this.onSignalingChange);
    this.pc.removeEventListener("iceconnectionstatechange", this.onIceConnectionStateChange);
    this.pc.removeEventListener("icegatheringstatechange", this.onIceGatherChange);
    this.unsubscribeIceTrickle?.();
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
  }
};
var TransceiverCache = class {
  constructor() {
    this.cache = [];
    this.layers = [];
    this.transceiverOrder = [];
    this.add = (publishOption, transceiver) => {
      this.cache.push({
        publishOption,
        transceiver
      });
      this.transceiverOrder.push(transceiver);
    };
    this.get = (publishOption) => {
      return this.findTransceiver(publishOption)?.transceiver;
    };
    this.has = (publishOption) => {
      return !!this.get(publishOption);
    };
    this.find = (predicate) => {
      return this.cache.find(predicate);
    };
    this.items = () => {
      return this.cache;
    };
    this.indexOf = (transceiver) => {
      return this.transceiverOrder.indexOf(transceiver);
    };
    this.getLayers = (publishOption) => {
      const entry = this.layers.find((item) => item.publishOption.id === publishOption.id && item.publishOption.trackType === publishOption.trackType);
      return entry?.layers;
    };
    this.setLayers = (publishOption, layers = []) => {
      const entry = this.findLayer(publishOption);
      if (entry) {
        entry.layers = layers;
      } else {
        this.layers.push({
          publishOption,
          layers
        });
      }
    };
    this.findTransceiver = (publishOption) => {
      return this.cache.find((item) => item.publishOption.id === publishOption.id && item.publishOption.trackType === publishOption.trackType);
    };
    this.findLayer = (publishOption) => {
      return this.layers.find((item) => item.publishOption.id === publishOption.id && item.publishOption.trackType === publishOption.trackType);
    };
  }
};
var ensureExhausted = (x, message) => {
  getLogger(["helpers"])("warn", message, x);
};
var trackTypeToParticipantStreamKey = (trackType) => {
  switch (trackType) {
    case TrackType.SCREEN_SHARE:
      return "screenShareStream";
    case TrackType.SCREEN_SHARE_AUDIO:
      return "screenShareAudioStream";
    case TrackType.VIDEO:
      return "videoStream";
    case TrackType.AUDIO:
      return "audioStream";
    case TrackType.UNSPECIFIED:
      throw new Error("Track type is unspecified");
    default:
      ensureExhausted(trackType, "Unknown track type");
  }
};
var muteTypeToTrackType = (muteType) => {
  switch (muteType) {
    case "audio":
      return TrackType.AUDIO;
    case "video":
      return TrackType.VIDEO;
    case "screenshare":
      return TrackType.SCREEN_SHARE;
    case "screenshare_audio":
      return TrackType.SCREEN_SHARE_AUDIO;
    default:
      ensureExhausted(muteType, "Unknown mute type");
  }
};
var toTrackType = (trackType) => {
  switch (trackType) {
    case "TRACK_TYPE_AUDIO":
      return TrackType.AUDIO;
    case "TRACK_TYPE_VIDEO":
      return TrackType.VIDEO;
    case "TRACK_TYPE_SCREEN_SHARE":
      return TrackType.SCREEN_SHARE;
    case "TRACK_TYPE_SCREEN_SHARE_AUDIO":
      return TrackType.SCREEN_SHARE_AUDIO;
    default:
      return void 0;
  }
};
var isAudioTrackType = (trackType) => trackType === TrackType.AUDIO || trackType === TrackType.SCREEN_SHARE_AUDIO;
var defaultBitratePerRid = {
  q: 3e5,
  h: 75e4,
  f: 125e4
};
var toSvcEncodings = (layers) => {
  if (!layers) return;
  const withRid = (rid) => (l) => l.rid === rid;
  const highestLayer = layers.find(withRid("f")) || layers.find(withRid("h")) || layers.find(withRid("q"));
  return [__spreadProps(__spreadValues({}, highestLayer), {
    rid: "q"
  })];
};
var ridToVideoQuality = (rid) => {
  return rid === "q" ? VideoQuality.LOW_UNSPECIFIED : rid === "h" ? VideoQuality.MID : VideoQuality.HIGH;
};
var toVideoLayers = (layers = []) => {
  return layers.map((layer) => ({
    rid: layer.rid || "",
    bitrate: layer.maxBitrate || 0,
    fps: layer.maxFramerate || 0,
    quality: ridToVideoQuality(layer.rid || ""),
    videoDimension: {
      width: layer.width,
      height: layer.height
    }
  }));
};
var toScalabilityMode = (spatialLayers, temporalLayers) => `L${spatialLayers}T${temporalLayers}${spatialLayers > 1 ? "_KEY" : ""}`;
var computeVideoLayers = (videoTrack, publishOption) => {
  if (isAudioTrackType(publishOption.trackType)) return;
  const optimalVideoLayers = [];
  const settings = videoTrack.getSettings();
  const {
    width = 0,
    height = 0
  } = settings;
  const {
    bitrate,
    codec,
    fps,
    maxSpatialLayers = 3,
    maxTemporalLayers = 3,
    videoDimension = {
      width: 1280,
      height: 720
    }
  } = publishOption;
  const maxBitrate = getComputedMaxBitrate(videoDimension, width, height, bitrate);
  let downscaleFactor = 1;
  let bitrateFactor = 1;
  const svcCodec = isSvcCodec(codec?.name);
  for (const rid of ["f", "h", "q"].slice(0, maxSpatialLayers)) {
    const layer = {
      active: true,
      rid,
      width: Math.round(width / downscaleFactor),
      height: Math.round(height / downscaleFactor),
      maxBitrate: Math.round(maxBitrate / bitrateFactor) || defaultBitratePerRid[rid],
      maxFramerate: fps
    };
    if (svcCodec) {
      layer.scalabilityMode = toScalabilityMode(maxSpatialLayers, maxTemporalLayers);
    } else {
      layer.scaleResolutionDownBy = downscaleFactor;
    }
    downscaleFactor *= 2;
    bitrateFactor *= 2;
    optimalVideoLayers.unshift(layer);
  }
  return withSimulcastConstraints(settings, optimalVideoLayers);
};
var getComputedMaxBitrate = (targetResolution, currentWidth, currentHeight, bitrate) => {
  const {
    width: targetWidth,
    height: targetHeight
  } = targetResolution;
  if (currentWidth < targetWidth || currentHeight < targetHeight) {
    const currentPixels = currentWidth * currentHeight;
    const targetPixels = targetWidth * targetHeight;
    const reductionFactor = currentPixels / targetPixels;
    return Math.round(bitrate * reductionFactor);
  }
  return bitrate;
};
var withSimulcastConstraints = (settings, optimalVideoLayers) => {
  let layers;
  const size = Math.max(settings.width || 0, settings.height || 0);
  if (size <= 320) {
    layers = optimalVideoLayers.filter((layer) => layer.rid === "f");
  } else if (size <= 640) {
    layers = optimalVideoLayers.filter((layer) => layer.rid !== "h");
  } else {
    layers = optimalVideoLayers;
  }
  const ridMapping = ["q", "h", "f"];
  return layers.map((layer, index) => __spreadProps(__spreadValues({}, layer), {
    rid: ridMapping[index]
    // reassign rid
  }));
};
var extractMid = (transceiver, transceiverInitIndex, sdp2) => {
  if (transceiver.mid) return transceiver.mid;
  if (!sdp2) return String(transceiverInitIndex);
  const track = transceiver.sender.track;
  const parsedSdp = (0, import_sdp_transform.parse)(sdp2);
  const media = parsedSdp.media.find((m) => {
    return m.type === track.kind && // if `msid` is not present, we assume that the track is the first one
    (m.msid?.includes(track.id) ?? true);
  });
  if (typeof media?.mid !== "undefined") return String(media.mid);
  if (transceiverInitIndex < 0) return "";
  return String(transceiverInitIndex);
};
var Publisher = class extends BasePeerConnection {
  /**
   * Constructs a new `Publisher` instance.
   */
  constructor(_a) {
    var _b = _a, {
      publishOptions
    } = _b, baseOptions = __objRest(_b, [
      "publishOptions"
    ]);
    super(PeerType.PUBLISHER_UNSPECIFIED, baseOptions);
    this.transceiverCache = new TransceiverCache();
    this.clonedTracks = /* @__PURE__ */ new Set();
    this.publish = (track, trackType) => __async(this, null, function* () {
      if (!this.publishOptions.some((o) => o.trackType === trackType)) {
        throw new Error(`No publish options found for ${TrackType[trackType]}`);
      }
      for (const publishOption of this.publishOptions) {
        if (publishOption.trackType !== trackType) continue;
        const trackToPublish = this.cloneTrack(track);
        const transceiver = this.transceiverCache.get(publishOption);
        if (!transceiver) {
          yield this.addTransceiver(trackToPublish, publishOption);
        } else {
          const previousTrack = transceiver.sender.track;
          yield this.updateTransceiver(transceiver, trackToPublish, trackType);
          if (!isReactNative()) {
            this.stopTrack(previousTrack);
          }
        }
      }
    });
    this.addTransceiver = (track, publishOption) => __async(this, null, function* () {
      const videoEncodings = computeVideoLayers(track, publishOption);
      const sendEncodings = isSvcCodec(publishOption.codec?.name) ? toSvcEncodings(videoEncodings) : videoEncodings;
      const transceiver = this.pc.addTransceiver(track, {
        direction: "sendonly",
        sendEncodings
      });
      const trackType = publishOption.trackType;
      this.logger("debug", `Added ${TrackType[trackType]} transceiver`);
      this.transceiverCache.add(publishOption, transceiver);
      this.trackIdToTrackType.set(track.id, trackType);
      yield this.negotiate();
    });
    this.updateTransceiver = (transceiver, track, trackType) => __async(this, null, function* () {
      const sender = transceiver.sender;
      if (sender.track) this.trackIdToTrackType.delete(sender.track.id);
      yield sender.replaceTrack(track);
      if (track) this.trackIdToTrackType.set(track.id, trackType);
    });
    this.syncPublishOptions = () => __async(this, null, function* () {
      for (const publishOption of this.publishOptions) {
        const {
          trackType
        } = publishOption;
        if (!this.isPublishing(trackType)) continue;
        if (this.transceiverCache.has(publishOption)) continue;
        const item = this.transceiverCache.find((i) => !!i.transceiver.sender.track && i.publishOption.trackType === trackType);
        if (!item || !item.transceiver) continue;
        const track = this.cloneTrack(item.transceiver.sender.track);
        yield this.addTransceiver(track, publishOption);
      }
      for (const item of this.transceiverCache.items()) {
        const {
          publishOption,
          transceiver
        } = item;
        const hasPublishOption = this.publishOptions.some((option) => option.id === publishOption.id && option.trackType === publishOption.trackType);
        if (hasPublishOption) continue;
        this.stopTrack(transceiver.sender.track);
        yield this.updateTransceiver(transceiver, null, publishOption.trackType);
      }
    });
    this.isPublishing = (trackType) => {
      for (const item of this.transceiverCache.items()) {
        if (item.publishOption.trackType !== trackType) continue;
        const track = item.transceiver.sender.track;
        if (!track) continue;
        if (track.readyState === "live" && track.enabled) return true;
      }
      return false;
    };
    this.stopTracks = (...trackTypes) => {
      for (const item of this.transceiverCache.items()) {
        const {
          publishOption,
          transceiver
        } = item;
        if (!trackTypes.includes(publishOption.trackType)) continue;
        this.stopTrack(transceiver.sender.track);
      }
    };
    this.stopAllTracks = () => {
      for (const {
        transceiver
      } of this.transceiverCache.items()) {
        this.stopTrack(transceiver.sender.track);
      }
      for (const track of this.clonedTracks) {
        this.stopTrack(track);
      }
    };
    this.changePublishQuality = (videoSender) => __async(this, null, function* () {
      const {
        trackType,
        layers,
        publishOptionId
      } = videoSender;
      const enabledLayers = layers.filter((l) => l.active);
      const tag = "Update publish quality:";
      this.logger("info", `${tag} requested layers by SFU:`, enabledLayers);
      const transceiverId = this.transceiverCache.find((t) => t.publishOption.id === publishOptionId && t.publishOption.trackType === trackType);
      const sender = transceiverId?.transceiver.sender;
      if (!sender) {
        return this.logger("warn", `${tag} no video sender found.`);
      }
      const params = sender.getParameters();
      if (params.encodings.length === 0) {
        return this.logger("warn", `${tag} there are no encodings set.`);
      }
      const codecInUse = transceiverId?.publishOption.codec?.name;
      const usesSvcCodec = codecInUse && isSvcCodec(codecInUse);
      let changed = false;
      for (const encoder of params.encodings) {
        const layer = usesSvcCodec ? (
          // for SVC, we only have one layer (q) and often rid is omitted
          enabledLayers[0]
        ) : (
          // for non-SVC, we need to find the layer by rid (simulcast)
          enabledLayers.find((l) => l.name === encoder.rid) ?? (params.encodings.length === 1 ? enabledLayers[0] : void 0)
        );
        const shouldActivate = !!layer?.active;
        if (shouldActivate !== encoder.active) {
          encoder.active = shouldActivate;
          changed = true;
        }
        if (!layer) continue;
        const {
          maxFramerate,
          scaleResolutionDownBy,
          maxBitrate,
          scalabilityMode
        } = layer;
        if (scaleResolutionDownBy >= 1 && scaleResolutionDownBy !== encoder.scaleResolutionDownBy) {
          encoder.scaleResolutionDownBy = scaleResolutionDownBy;
          changed = true;
        }
        if (maxBitrate > 0 && maxBitrate !== encoder.maxBitrate) {
          encoder.maxBitrate = maxBitrate;
          changed = true;
        }
        if (maxFramerate > 0 && maxFramerate !== encoder.maxFramerate) {
          encoder.maxFramerate = maxFramerate;
          changed = true;
        }
        if (scalabilityMode && scalabilityMode !== encoder.scalabilityMode) {
          encoder.scalabilityMode = scalabilityMode;
          changed = true;
        }
      }
      const activeEncoders = params.encodings.filter((e) => e.active);
      if (!changed) {
        return this.logger("info", `${tag} no change:`, activeEncoders);
      }
      yield sender.setParameters(params);
      this.logger("info", `${tag} enabled rids:`, activeEncoders);
    });
    this.restartIce = () => __async(this, null, function* () {
      this.logger("debug", "Restarting ICE connection");
      const signalingState = this.pc.signalingState;
      if (this.isIceRestarting || signalingState === "have-local-offer") {
        this.logger("debug", "ICE restart is already in progress");
        return;
      }
      yield this.negotiate({
        iceRestart: true
      });
    });
    this.negotiate = (options) => __async(this, null, function* () {
      return withoutConcurrency("publisher.negotiate", () => __async(this, null, function* () {
        const offer = yield this.pc.createOffer(options);
        const tracks = this.getAnnouncedTracks(offer.sdp);
        if (!tracks.length) throw new Error(`Can't negotiate without any tracks`);
        try {
          this.isIceRestarting = options?.iceRestart ?? false;
          yield this.pc.setLocalDescription(offer);
          const {
            sdp: sdp2 = ""
          } = offer;
          const {
            response
          } = yield this.sfuClient.setPublisher({
            sdp: sdp2,
            tracks
          });
          if (response.error) throw new Error(response.error.message);
          const {
            sdp: answerSdp
          } = response;
          yield this.pc.setRemoteDescription({
            type: "answer",
            sdp: answerSdp
          });
        } finally {
          this.isIceRestarting = false;
        }
        this.addTrickledIceCandidates();
      }));
    });
    this.getPublishedTracks = () => {
      const tracks = [];
      for (const {
        transceiver
      } of this.transceiverCache.items()) {
        const track = transceiver.sender.track;
        if (track && track.readyState === "live") tracks.push(track);
      }
      return tracks;
    };
    this.getAnnouncedTracks = (sdp2) => {
      const trackInfos = [];
      for (const bundle of this.transceiverCache.items()) {
        const {
          transceiver,
          publishOption
        } = bundle;
        const track = transceiver.sender.track;
        if (!track) continue;
        trackInfos.push(this.toTrackInfo(transceiver, publishOption, sdp2));
      }
      return trackInfos;
    };
    this.getAnnouncedTracksForReconnect = () => {
      const sdp2 = this.pc.localDescription?.sdp;
      const trackInfos = [];
      for (const publishOption of this.publishOptions) {
        const transceiver = this.transceiverCache.get(publishOption);
        if (!transceiver || !transceiver.sender.track) continue;
        trackInfos.push(this.toTrackInfo(transceiver, publishOption, sdp2));
      }
      return trackInfos;
    };
    this.toTrackInfo = (transceiver, publishOption, sdp2) => {
      const track = transceiver.sender.track;
      const isTrackLive = track.readyState === "live";
      const layers = isTrackLive ? computeVideoLayers(track, publishOption) : this.transceiverCache.getLayers(publishOption);
      this.transceiverCache.setLayers(publishOption, layers);
      const isAudioTrack = isAudioTrackType(publishOption.trackType);
      const isStereo = isAudioTrack && track.getSettings().channelCount === 2;
      const transceiverIndex = this.transceiverCache.indexOf(transceiver);
      const audioSettings = this.state.settings?.audio;
      return {
        trackId: track.id,
        layers: toVideoLayers(layers),
        trackType: publishOption.trackType,
        mid: extractMid(transceiver, transceiverIndex, sdp2),
        stereo: isStereo,
        dtx: isAudioTrack && !!audioSettings?.opus_dtx_enabled,
        red: isAudioTrack && !!audioSettings?.redundant_coding_enabled,
        muted: !isTrackLive,
        codec: publishOption.codec,
        publishOptionId: publishOption.id
      };
    };
    this.cloneTrack = (track) => {
      const clone = track.clone();
      this.clonedTracks.add(clone);
      return clone;
    };
    this.stopTrack = (track) => {
      if (!track) return;
      track.stop();
      this.clonedTracks.delete(track);
    };
    this.publishOptions = publishOptions;
    this.on("iceRestart", (iceRestart) => {
      if (iceRestart.peerType !== PeerType.PUBLISHER_UNSPECIFIED) return;
      this.restartIce().catch((err) => {
        const reason = `ICE restart failed`;
        this.logger("warn", reason, err);
        this.onUnrecoverableError?.(`${reason}: ${err}`);
      });
    });
    this.on("changePublishQuality", (event) => __async(this, null, function* () {
      for (const videoSender of event.videoSenders) {
        yield this.changePublishQuality(videoSender);
      }
    }));
    this.on("changePublishOptions", (event) => {
      this.publishOptions = event.publishOptions;
      return this.syncPublishOptions();
    });
  }
  /**
   * Disposes this Publisher instance.
   */
  dispose() {
    super.dispose();
    this.stopAllTracks();
    this.clonedTracks.clear();
  }
};
var Subscriber = class extends BasePeerConnection {
  /**
   * Constructs a new `Subscriber` instance.
   */
  constructor(opts) {
    super(PeerType.SUBSCRIBER, opts);
    this.restartIce = () => __async(this, null, function* () {
      this.logger("debug", "Restarting ICE connection");
      if (this.pc.signalingState === "have-remote-offer") {
        this.logger("debug", "ICE restart is already in progress");
        return;
      }
      if (this.pc.connectionState === "new") {
        this.logger("debug", `ICE connection is not yet established, skipping restart.`);
        return;
      }
      const previousIsIceRestarting = this.isIceRestarting;
      try {
        this.isIceRestarting = true;
        yield this.sfuClient.iceRestart({
          peerType: PeerType.SUBSCRIBER
        });
      } catch (e) {
        this.isIceRestarting = previousIsIceRestarting;
        throw e;
      }
    });
    this.handleOnTrack = (e) => {
      const [primaryStream] = e.streams;
      const [trackId, rawTrackType] = primaryStream.id.split(":");
      const participantToUpdate = this.state.participants.find((p) => p.trackLookupPrefix === trackId);
      this.logger("debug", `[onTrack]: Got remote ${rawTrackType} track for userId: ${participantToUpdate?.userId}`, e.track.id, e.track);
      const trackDebugInfo = `${participantToUpdate?.userId} ${rawTrackType}:${trackId}`;
      e.track.addEventListener("mute", () => {
        this.logger("info", `[onTrack]: Track muted: ${trackDebugInfo}`);
      });
      e.track.addEventListener("unmute", () => {
        this.logger("info", `[onTrack]: Track unmuted: ${trackDebugInfo}`);
      });
      e.track.addEventListener("ended", () => {
        this.logger("info", `[onTrack]: Track ended: ${trackDebugInfo}`);
        this.state.removeOrphanedTrack(primaryStream.id);
      });
      const trackType = toTrackType(rawTrackType);
      if (!trackType) {
        return this.logger("error", `Unknown track type: ${rawTrackType}`);
      }
      this.trackIdToTrackType.set(e.track.id, trackType);
      if (!participantToUpdate) {
        this.logger("warn", `[onTrack]: Received track for unknown participant: ${trackId}`, e);
        this.state.registerOrphanedTrack({
          id: primaryStream.id,
          trackLookupPrefix: trackId,
          track: primaryStream,
          trackType
        });
        return;
      }
      const streamKindProp = trackTypeToParticipantStreamKey(trackType);
      if (!streamKindProp) {
        this.logger("error", `Unknown track type: ${rawTrackType}`);
        return;
      }
      const previousStream = participantToUpdate[streamKindProp];
      this.state.updateParticipant(participantToUpdate.sessionId, {
        [streamKindProp]: primaryStream
      });
      if (previousStream) {
        this.logger("info", `[onTrack]: Cleaning up previous remote ${e.track.kind} tracks for userId: ${participantToUpdate.userId}`);
        previousStream.getTracks().forEach((t) => {
          t.stop();
          previousStream.removeTrack(t);
        });
      }
    };
    this.negotiate = (subscriberOffer) => __async(this, null, function* () {
      yield this.pc.setRemoteDescription({
        type: "offer",
        sdp: subscriberOffer.sdp
      });
      this.addTrickledIceCandidates();
      const answer = yield this.pc.createAnswer();
      yield this.pc.setLocalDescription(answer);
      yield this.sfuClient.sendAnswer({
        peerType: PeerType.SUBSCRIBER,
        sdp: answer.sdp || ""
      });
      this.isIceRestarting = false;
    });
    this.pc.addEventListener("track", this.handleOnTrack);
    this.on("subscriberOffer", (subscriberOffer) => __async(this, null, function* () {
      return this.negotiate(subscriberOffer).catch((err) => {
        this.logger("error", `Negotiation failed.`, err);
      });
    }));
  }
  /**
   * Detaches the event handlers from the `RTCPeerConnection`.
   * This is useful when we want to replace the `RTCPeerConnection`
   * instance with a new one (in case of migration).
   */
  detachEventHandlers() {
    super.detachEventHandlers();
    this.pc.removeEventListener("track", this.handleOnTrack);
  }
};
var createWebSocketSignalChannel = (opts) => {
  const {
    endpoint,
    onMessage,
    logTag
  } = opts;
  const logger2 = getLogger(["SfuClientWS", logTag]);
  logger2("debug", "Creating signaling WS channel:", endpoint);
  const ws = new WebSocket(endpoint);
  ws.binaryType = "arraybuffer";
  ws.addEventListener("error", (e) => {
    logger2("error", "Signaling WS channel error", e);
  });
  ws.addEventListener("close", (e) => {
    logger2("info", "Signaling WS channel is closed", e);
  });
  ws.addEventListener("open", (e) => {
    logger2("info", "Signaling WS channel is open", e);
  });
  ws.addEventListener("message", (e) => {
    try {
      const message = e.data instanceof ArrayBuffer ? SfuEvent.fromBinary(new Uint8Array(e.data)) : SfuEvent.fromJsonString(e.data.toString());
      onMessage(message);
    } catch (err) {
      logger2("error", "Failed to decode a message. Check whether the Proto models match.", {
        event: e,
        error: err
      });
    }
  });
  return ws;
};
var toRtcConfiguration = (config) => {
  return {
    bundlePolicy: "max-bundle",
    iceServers: config.map((ice) => ({
      urls: ice.urls,
      username: ice.username,
      credential: ice.password
    }))
  };
};
function makeSafePromise(promise) {
  let isPending = true;
  const safePromise = promise.then((result) => ({
    status: "resolved",
    result
  }), (error) => ({
    status: "rejected",
    error
  })).finally(() => isPending = false);
  const unwrapPromise = () => safePromise.then((fulfillment) => {
    if (fulfillment.status === "rejected") throw fulfillment.error;
    return fulfillment.result;
  });
  unwrapPromise.checkPending = () => isPending;
  return unwrapPromise;
}
var promiseWithResolvers = () => {
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  let isResolved = false;
  let isRejected = false;
  const resolver = (value) => {
    isResolved = true;
    resolve(value);
  };
  const rejecter = (reason) => {
    isRejected = true;
    reject(reason);
  };
  return {
    promise,
    resolve: resolver,
    reject: rejecter,
    isResolved: () => isResolved,
    isRejected: () => isRejected
  };
};
var uninitialized = Symbol("uninitialized");
function lazy(factory) {
  let value = uninitialized;
  return () => {
    if (value === uninitialized) {
      value = factory();
    }
    return value;
  };
}
var timerWorker = {
  src: `const timerIdMapping = new Map();
self.addEventListener('message', (event) => {
    const request = event.data;
    switch (request.type) {
        case 'setTimeout':
        case 'setInterval':
            timerIdMapping.set(request.id, (request.type === 'setTimeout' ? setTimeout : setInterval)(() => {
                tick(request.id);
                if (request.type === 'setTimeout') {
                    timerIdMapping.delete(request.id);
                }
            }, request.timeout));
            break;
        case 'clearTimeout':
        case 'clearInterval':
            (request.type === 'clearTimeout' ? clearTimeout : clearInterval)(timerIdMapping.get(request.id));
            timerIdMapping.delete(request.id);
            break;
    }
});
function tick(id) {
    const message = { type: 'tick', id };
    self.postMessage(message);
}`
};
var TimerWorker = class {
  constructor() {
    this.currentTimerId = 1;
    this.callbacks = /* @__PURE__ */ new Map();
    this.fallback = false;
  }
  setup({
    useTimerWorker = true
  } = {}) {
    if (!useTimerWorker) {
      this.fallback = true;
      return;
    }
    try {
      const source = timerWorker.src;
      const blob = new Blob([source], {
        type: "application/javascript; charset=utf-8"
      });
      const script = URL.createObjectURL(blob);
      this.worker = new Worker(script, {
        name: "str-timer-worker"
      });
      this.worker.addEventListener("message", (event) => {
        const {
          type,
          id
        } = event.data;
        if (type === "tick") {
          this.callbacks.get(id)?.();
        }
      });
    } catch (err) {
      getLogger(["timer-worker"])("error", err);
      this.fallback = true;
    }
  }
  destroy() {
    this.callbacks.clear();
    this.worker?.terminate();
    this.worker = void 0;
    this.fallback = false;
  }
  get ready() {
    return this.fallback || Boolean(this.worker);
  }
  setInterval(callback, timeout) {
    return this.setTimer("setInterval", callback, timeout);
  }
  clearInterval(id) {
    this.clearTimer("clearInterval", id);
  }
  setTimeout(callback, timeout) {
    return this.setTimer("setTimeout", callback, timeout);
  }
  clearTimeout(id) {
    this.clearTimer("clearTimeout", id);
  }
  setTimer(type, callback, timeout) {
    if (!this.ready) {
      this.setup();
    }
    if (this.fallback) {
      return (type === "setTimeout" ? setTimeout : setInterval)(callback, timeout);
    }
    const id = this.getTimerId();
    this.callbacks.set(id, () => {
      callback();
      if (type === "setTimeout") {
        this.callbacks.delete(id);
      }
    });
    this.sendMessage({
      type,
      id,
      timeout
    });
    return id;
  }
  clearTimer(type, id) {
    if (!id) {
      return;
    }
    if (!this.ready) {
      this.setup();
    }
    if (this.fallback) {
      (type === "clearTimeout" ? clearTimeout : clearInterval)(id);
      return;
    }
    this.callbacks.delete(id);
    this.sendMessage({
      type,
      id
    });
  }
  getTimerId() {
    return this.currentTimerId++;
  }
  sendMessage(message) {
    if (!this.worker) {
      throw new Error("Cannot use timer worker before it's set up");
    }
    this.worker.postMessage(message);
  }
};
var timerWorkerEnabled = false;
var enableTimerWorker = () => {
  timerWorkerEnabled = true;
};
var getTimers = lazy(() => {
  const instance = new TimerWorker();
  instance.setup({
    useTimerWorker: timerWorkerEnabled
  });
  return instance;
});
var StreamSfuClient = class _StreamSfuClient {
  /**
   * Constructs a new SFU client.
   */
  constructor({
    dispatcher,
    credentials,
    sessionId,
    logTag,
    joinResponseTimeout = 5e3,
    onSignalClose,
    streamClient,
    enableTracing
  }) {
    this.iceTrickleBuffer = new IceTrickleBuffer();
    this.isLeaving = false;
    this.isClosing = false;
    this.pingIntervalInMs = 10 * 1e3;
    this.unhealthyTimeoutInMs = this.pingIntervalInMs + 5 * 1e3;
    this.joinResponseTask = promiseWithResolvers();
    this.abortController = new AbortController();
    this.createWebSocket = () => {
      const eventsToTrace = {
        callEnded: true,
        changePublishQuality: true,
        error: true,
        goAway: true
      };
      this.signalWs = createWebSocketSignalChannel({
        logTag: this.logTag,
        endpoint: `${this.credentials.server.ws_endpoint}?tag=${this.logTag}`,
        onMessage: (message) => {
          this.lastMessageTimestamp = /* @__PURE__ */ new Date();
          this.scheduleConnectionCheck();
          const eventKind = message.eventPayload.oneofKind;
          if (eventsToTrace[eventKind]) {
            this.tracer?.trace(eventKind, message);
          }
          this.dispatcher.dispatch(message, this.logTag);
        }
      });
      this.signalReady = makeSafePromise(Promise.race([new Promise((resolve, reject) => {
        const onOpen = () => {
          this.signalWs.removeEventListener("open", onOpen);
          resolve(this.signalWs);
        };
        this.signalWs.addEventListener("open", onOpen);
        this.signalWs.addEventListener("close", (e) => {
          this.handleWebSocketClose(e);
          reject(new Error("SFU WS closed unexpectedly"));
        });
      }), new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("SFU WS connection timed out")), this.joinResponseTimeout);
      })]));
    };
    this.cleanUpWebSocket = () => {
      this.signalWs.removeEventListener("close", this.handleWebSocketClose);
    };
    this.handleWebSocketClose = (e) => {
      this.signalWs.removeEventListener("close", this.handleWebSocketClose);
      getTimers().clearInterval(this.keepAliveInterval);
      clearTimeout(this.connectionCheckTimeout);
      this.onSignalClose?.(`${e.code} ${e.reason}`);
    };
    this.close = (code = _StreamSfuClient.NORMAL_CLOSURE, reason) => {
      this.isClosing = true;
      if (this.signalWs.readyState === WebSocket.OPEN) {
        this.logger("debug", `Closing SFU WS connection: ${code} - ${reason}`);
        this.signalWs.close(code, `js-client: ${reason}`);
        this.cleanUpWebSocket();
      }
      this.dispose();
    };
    this.dispose = () => {
      this.logger("debug", "Disposing SFU client");
      this.unsubscribeIceTrickle();
      this.unsubscribeNetworkChanged();
      clearInterval(this.keepAliveInterval);
      clearTimeout(this.connectionCheckTimeout);
      clearTimeout(this.migrateAwayTimeout);
      this.abortController.abort();
      this.migrationTask?.resolve();
      this.iceTrickleBuffer.dispose();
    };
    this.getTrace = () => {
      return this.tracer?.take();
    };
    this.leaveAndClose = (reason) => __async(this, null, function* () {
      yield this.joinTask;
      try {
        this.isLeaving = true;
        yield this.notifyLeave(reason);
      } catch (err) {
        this.logger("debug", "Error notifying SFU about leaving call", err);
      }
      this.close(_StreamSfuClient.NORMAL_CLOSURE, reason.substring(0, 115));
    });
    this.updateSubscriptions = (tracks) => __async(this, null, function* () {
      yield this.joinTask;
      return retryable(() => this.rpc.updateSubscriptions({
        sessionId: this.sessionId,
        tracks
      }), this.abortController.signal);
    });
    this.setPublisher = (data) => __async(this, null, function* () {
      yield this.joinTask;
      return retryable(() => this.rpc.setPublisher(__spreadProps(__spreadValues({}, data), {
        sessionId: this.sessionId
      })), this.abortController.signal);
    });
    this.sendAnswer = (data) => __async(this, null, function* () {
      yield this.joinTask;
      return retryable(() => this.rpc.sendAnswer(__spreadProps(__spreadValues({}, data), {
        sessionId: this.sessionId
      })), this.abortController.signal);
    });
    this.iceTrickle = (data) => __async(this, null, function* () {
      yield this.joinTask;
      return retryable(() => this.rpc.iceTrickle(__spreadProps(__spreadValues({}, data), {
        sessionId: this.sessionId
      })), this.abortController.signal);
    });
    this.iceRestart = (data) => __async(this, null, function* () {
      yield this.joinTask;
      return retryable(() => this.rpc.iceRestart(__spreadProps(__spreadValues({}, data), {
        sessionId: this.sessionId
      })), this.abortController.signal);
    });
    this.updateMuteStates = (muteStates) => __async(this, null, function* () {
      yield this.joinTask;
      return retryable(() => this.rpc.updateMuteStates({
        muteStates,
        sessionId: this.sessionId
      }), this.abortController.signal);
    });
    this.sendStats = (stats) => __async(this, null, function* () {
      yield this.joinTask;
      return this.rpc.sendStats(__spreadProps(__spreadValues({}, stats), {
        sessionId: this.sessionId
      }));
    });
    this.startNoiseCancellation = () => __async(this, null, function* () {
      yield this.joinTask;
      return retryable(() => this.rpc.startNoiseCancellation({
        sessionId: this.sessionId
      }), this.abortController.signal);
    });
    this.stopNoiseCancellation = () => __async(this, null, function* () {
      yield this.joinTask;
      return retryable(() => this.rpc.stopNoiseCancellation({
        sessionId: this.sessionId
      }), this.abortController.signal);
    });
    this.enterMigration = (..._0) => __async(this, [..._0], function* (opts = {}) {
      this.isLeaving = true;
      const {
        timeout = 7 * 1e3
      } = opts;
      this.migrationTask?.reject(new Error("Cancelled previous migration"));
      const task = this.migrationTask = promiseWithResolvers();
      const unsubscribe = this.dispatcher.on("participantMigrationComplete", () => {
        unsubscribe();
        clearTimeout(this.migrateAwayTimeout);
        task.resolve();
      });
      this.migrateAwayTimeout = setTimeout(() => {
        unsubscribe();
        task.reject(new Error(`Migration (${this.logTag}) failed to complete in ${timeout}ms`));
      }, timeout);
      return task.promise;
    });
    this.join = (data) => __async(this, null, function* () {
      yield this.signalReady();
      if (this.joinResponseTask.isResolved() || this.joinResponseTask.isRejected()) {
        this.joinResponseTask = promiseWithResolvers();
      }
      const current = this.joinResponseTask;
      let timeoutId = void 0;
      const unsubscribe = this.dispatcher.on("joinResponse", (joinResponse) => {
        this.logger("debug", "Received joinResponse", joinResponse);
        clearTimeout(timeoutId);
        unsubscribe();
        this.keepAlive();
        current.resolve(joinResponse);
      });
      timeoutId = setTimeout(() => {
        unsubscribe();
        current.reject(new Error('Waiting for "joinResponse" has timed out'));
      }, this.joinResponseTimeout);
      const joinRequest = SfuRequest.create({
        requestPayload: {
          oneofKind: "joinRequest",
          joinRequest: JoinRequest.create(__spreadProps(__spreadValues({}, data), {
            sessionId: this.sessionId,
            token: this.credentials.token
          }))
        }
      });
      this.tracer?.trace("joinRequest", joinRequest);
      yield this.send(joinRequest);
      return current.promise;
    });
    this.ping = () => __async(this, null, function* () {
      return this.send(SfuRequest.create({
        requestPayload: {
          oneofKind: "healthCheckRequest",
          healthCheckRequest: {}
        }
      }));
    });
    this.notifyLeave = (reason) => __async(this, null, function* () {
      return this.send(SfuRequest.create({
        requestPayload: {
          oneofKind: "leaveCallRequest",
          leaveCallRequest: {
            sessionId: this.sessionId,
            reason
          }
        }
      }));
    });
    this.send = (message) => __async(this, null, function* () {
      yield this.signalReady();
      const msgJson = SfuRequest.toJson(message);
      if (this.signalWs.readyState !== WebSocket.OPEN) {
        this.logger("debug", "Signal WS is not open. Skipping message", msgJson);
        return;
      }
      this.logger("debug", `Sending message to: ${this.edgeName}`, msgJson);
      this.signalWs.send(SfuRequest.toBinary(message));
    });
    this.keepAlive = () => {
      const timers = getTimers();
      timers.clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = timers.setInterval(() => {
        this.ping().catch((e) => {
          this.logger("error", "Error sending healthCheckRequest to SFU", e);
        });
      }, this.pingIntervalInMs);
    };
    this.scheduleConnectionCheck = () => {
      clearTimeout(this.connectionCheckTimeout);
      this.connectionCheckTimeout = setTimeout(() => {
        if (this.lastMessageTimestamp) {
          const timeSinceLastMessage = (/* @__PURE__ */ new Date()).getTime() - this.lastMessageTimestamp.getTime();
          if (timeSinceLastMessage > this.unhealthyTimeoutInMs) {
            this.close(_StreamSfuClient.ERROR_CONNECTION_UNHEALTHY, `SFU connection unhealthy. Didn't receive any message for ${this.unhealthyTimeoutInMs}ms`);
          }
        }
      }, this.unhealthyTimeoutInMs);
    };
    this.dispatcher = dispatcher;
    this.sessionId = sessionId || generateUUIDv4();
    this.onSignalClose = onSignalClose;
    this.credentials = credentials;
    const {
      server,
      token
    } = credentials;
    this.edgeName = server.edge_name;
    this.joinResponseTimeout = joinResponseTimeout;
    this.logTag = logTag;
    this.logger = getLogger(["SfuClient", logTag]);
    this.tracer = enableTracing ? new Tracer(`${logTag}-${this.edgeName}`) : void 0;
    this.rpc = createSignalClient({
      baseUrl: server.url,
      interceptors: [withHeaders({
        Authorization: `Bearer ${token}`
      }), this.tracer && withRequestTracer(this.tracer.trace), getLogLevel() === "trace" && withRequestLogger(this.logger, "trace")].filter((v) => !!v)
    });
    this.unsubscribeIceTrickle = dispatcher.on("iceTrickle", (iceTrickle) => {
      this.iceTrickleBuffer.push(iceTrickle);
    });
    this.unsubscribeNetworkChanged = streamClient.on("network.changed", (e) => {
      if (!e.online) {
        this.networkAvailableTask = promiseWithResolvers();
      } else {
        this.networkAvailableTask?.resolve();
      }
    });
    this.createWebSocket();
  }
  get isHealthy() {
    return this.signalWs.readyState === WebSocket.OPEN && this.joinResponseTask.isResolved();
  }
  get joinTask() {
    return this.joinResponseTask.promise;
  }
};
StreamSfuClient.NORMAL_CLOSURE = 1e3;
StreamSfuClient.ERROR_CONNECTION_UNHEALTHY = 4001;
StreamSfuClient.DISPOSE_OLD_SOCKET = 4002;
var watchCallAccepted = (call) => {
  return function onCallAccepted(event) {
    return __async(this, null, function* () {
      if (event.user.id === call.currentUserId) return;
      const {
        state
      } = call;
      if (event.call.created_by.id === call.currentUserId && state.callingState === CallingState.RINGING) {
        yield call.join();
      }
    });
  };
};
var watchCallRejected = (call) => {
  return function onCallRejected(event) {
    return __async(this, null, function* () {
      if (event.user.id === call.currentUserId) return;
      const {
        call: eventCall
      } = event;
      const {
        session: callSession
      } = eventCall;
      if (!callSession) {
        call.logger("warn", "No call session provided. Ignoring call.rejected event.", event);
        return;
      }
      const rejectedBy = callSession.rejected_by;
      const {
        members,
        callingState
      } = call.state;
      if (callingState !== CallingState.RINGING) {
        call.logger("info", "Call is not in ringing mode (it is either accepted or rejected already). Ignoring call.rejected event.", event);
        return;
      }
      if (call.isCreatedByMe) {
        const everyoneElseRejected = members.filter((m) => m.user_id !== call.currentUserId).every((m) => rejectedBy[m.user_id]);
        if (everyoneElseRejected) {
          call.logger("info", "everyone rejected, leaving the call");
          yield call.leave({
            reject: true,
            reason: "cancel",
            message: "ring: everyone rejected"
          });
        }
      } else {
        if (rejectedBy[eventCall.created_by.id]) {
          call.logger("info", "call creator rejected, leaving call");
          yield call.leave({
            message: "ring: creator rejected"
          });
        }
      }
    });
  };
};
var watchCallEnded = (call) => {
  return function onCallEnded() {
    const {
      callingState
    } = call.state;
    if (callingState !== CallingState.IDLE && callingState !== CallingState.LEFT) {
      call.leave({
        message: "call.ended event received",
        reject: false
      }).catch((err) => {
        call.logger("error", "Failed to leave call after call.ended ", err);
      });
    }
  };
};
var watchSfuCallEnded = (call) => {
  return call.on("callEnded", (e) => __async(void 0, null, function* () {
    if (call.state.callingState === CallingState.LEFT) return;
    try {
      call.state.setEndedAt(/* @__PURE__ */ new Date());
      const reason = CallEndedReason[e.reason];
      yield call.leave({
        message: `callEnded received: ${reason}`
      });
    } catch (err) {
      call.logger("error", "Failed to leave call after being ended by the SFU", err);
    }
  }));
};
var watchCallGrantsUpdated = (state) => {
  return function onCallGrantsUpdated(event) {
    const {
      currentGrants
    } = event;
    if (currentGrants) {
      const {
        canPublishAudio,
        canPublishVideo,
        canScreenshare
      } = currentGrants;
      const update = {
        [OwnCapability.SEND_AUDIO]: canPublishAudio,
        [OwnCapability.SEND_VIDEO]: canPublishVideo,
        [OwnCapability.SCREENSHARE]: canScreenshare
      };
      const nextCapabilities = state.ownCapabilities.filter((capability) => update[capability] !== false);
      Object.entries(update).forEach(([capability, value]) => {
        if (value && !nextCapabilities.includes(capability)) {
          nextCapabilities.push(capability);
        }
      });
      state.setOwnCapabilities(nextCapabilities);
    }
  };
};
var watchConnectionQualityChanged = (dispatcher, state) => {
  return dispatcher.on("connectionQualityChanged", (e) => {
    const {
      connectionQualityUpdates
    } = e;
    if (!connectionQualityUpdates) return;
    state.updateParticipants(connectionQualityUpdates.reduce((patches, update) => {
      const {
        sessionId,
        connectionQuality
      } = update;
      patches[sessionId] = {
        connectionQuality
      };
      return patches;
    }, {}));
  });
};
var watchParticipantCountChanged = (dispatcher, state) => {
  return dispatcher.on("healthCheckResponse", (e) => {
    const {
      participantCount
    } = e;
    if (participantCount) {
      state.setParticipantCount(participantCount.total);
      state.setAnonymousParticipantCount(participantCount.anonymous);
    }
  });
};
var watchLiveEnded = (dispatcher, call) => {
  return dispatcher.on("error", (e) => {
    if (e.error && e.error.code !== ErrorCode.LIVE_ENDED) return;
    call.state.setBackstage(true);
    if (!call.permissionsContext.hasPermission(OwnCapability.JOIN_BACKSTAGE)) {
      call.leave({
        message: "live ended"
      }).catch((err) => {
        call.logger("error", "Failed to leave call after live ended", err);
      });
    }
  });
};
var watchSfuErrorReports = (dispatcher) => {
  return dispatcher.on("error", (e) => {
    if (!e.error) return;
    const logger2 = getLogger(["SfuClient"]);
    const {
      error,
      reconnectStrategy
    } = e;
    logger2("error", "SFU reported error", {
      code: ErrorCode[error.code],
      reconnectStrategy: WebsocketReconnectStrategy[reconnectStrategy],
      message: error.message,
      shouldRetry: error.shouldRetry
    });
  });
};
var watchPinsUpdated = (state) => {
  return function onPinsUpdated(e) {
    const {
      pins
    } = e;
    state.setServerSidePins(pins);
  };
};
var handleRemoteSoftMute = (call) => {
  return call.on("trackUnpublished", (event) => __async(void 0, null, function* () {
    const {
      cause,
      type,
      sessionId
    } = event;
    const {
      localParticipant
    } = call.state;
    if (cause === TrackUnpublishReason.MODERATION && sessionId === localParticipant?.sessionId) {
      const logger2 = call.logger;
      logger2("info", `Local participant's ${TrackType[type]} track is muted remotely`);
      try {
        if (type === TrackType.VIDEO) {
          yield call.camera.disable();
        } else if (type === TrackType.AUDIO) {
          yield call.microphone.disable();
        } else if (type === TrackType.SCREEN_SHARE || type === TrackType.SCREEN_SHARE_AUDIO) {
          yield call.screenShare.disable();
        } else {
          logger2("warn", "Unsupported track type to soft mute", TrackType[type]);
        }
      } catch (error) {
        logger2("error", "Failed to stop publishing", error);
      }
    }
  }));
};
var pushToIfMissing = (arr, ...values) => {
  for (const v of values) {
    if (!arr.includes(v)) {
      arr.push(v);
    }
  }
  return arr;
};
var watchParticipantJoined = (state) => {
  return function onParticipantJoined(e) {
    const {
      participant
    } = e;
    if (!participant) return;
    const orphanedTracks = reconcileOrphanedTracks(state, participant);
    state.updateOrAddParticipant(participant.sessionId, Object.assign(participant, orphanedTracks, {
      viewportVisibilityState: {
        videoTrack: VisibilityState.UNKNOWN,
        screenShareTrack: VisibilityState.UNKNOWN
      }
    }));
  };
};
var watchParticipantLeft = (state) => {
  return function onParticipantLeft(e) {
    const {
      participant
    } = e;
    if (!participant) return;
    state.setParticipants((participants) => participants.filter((p) => p.sessionId !== participant.sessionId));
  };
};
var watchParticipantUpdated = (state) => {
  return function onParticipantUpdated(e) {
    const {
      participant
    } = e;
    if (!participant) return;
    state.updateParticipant(participant.sessionId, participant);
  };
};
var watchTrackPublished = (state) => {
  return function onTrackPublished(e) {
    const {
      type,
      sessionId
    } = e;
    if (e.participant) {
      const orphanedTracks = reconcileOrphanedTracks(state, e.participant);
      const participant = Object.assign(e.participant, orphanedTracks);
      state.updateOrAddParticipant(sessionId, participant);
    } else {
      state.updateParticipant(sessionId, (p) => ({
        publishedTracks: pushToIfMissing([...p.publishedTracks], type)
      }));
    }
  };
};
var watchTrackUnpublished = (state) => {
  return function onTrackUnpublished(e) {
    const {
      type,
      sessionId
    } = e;
    if (e.participant) {
      const orphanedTracks = reconcileOrphanedTracks(state, e.participant);
      const participant = Object.assign(e.participant, orphanedTracks);
      state.updateOrAddParticipant(sessionId, participant);
    } else {
      state.updateParticipant(sessionId, (p) => ({
        publishedTracks: p.publishedTracks.filter((t) => t !== type)
      }));
    }
  };
};
var reconcileOrphanedTracks = (state, participant) => {
  const orphanTracks = state.takeOrphanedTracks(participant.trackLookupPrefix);
  if (!orphanTracks.length) return;
  const reconciledTracks = {};
  for (const orphan of orphanTracks) {
    const key = trackTypeToParticipantStreamKey(orphan.trackType);
    if (!key) continue;
    reconciledTracks[key] = orphan.track;
  }
  return reconciledTracks;
};
var watchDominantSpeakerChanged = (dispatcher, state) => {
  return dispatcher.on("dominantSpeakerChanged", (e) => {
    const {
      sessionId
    } = e;
    if (sessionId === state.dominantSpeaker?.sessionId) return;
    state.setParticipants((participants) => participants.map((participant) => {
      if (participant.sessionId === sessionId) {
        return __spreadProps(__spreadValues({}, participant), {
          isDominantSpeaker: true
        });
      }
      if (participant.isDominantSpeaker) {
        return __spreadProps(__spreadValues({}, participant), {
          isDominantSpeaker: false
        });
      }
      return participant;
    }));
  });
};
var watchAudioLevelChanged = (dispatcher, state) => {
  return dispatcher.on("audioLevelChanged", (e) => {
    const {
      audioLevels
    } = e;
    state.updateParticipants(audioLevels.reduce((patches, current) => {
      patches[current.sessionId] = {
        audioLevel: current.level,
        isSpeaking: current.isSpeaking
      };
      return patches;
    }, {}));
  });
};
var registerEventHandlers = (call, dispatcher) => {
  const state = call.state;
  const eventHandlers = [call.on("call.ended", watchCallEnded(call)), watchSfuCallEnded(call), watchLiveEnded(dispatcher, call), watchSfuErrorReports(dispatcher), watchConnectionQualityChanged(dispatcher, state), watchParticipantCountChanged(dispatcher, state), call.on("participantJoined", watchParticipantJoined(state)), call.on("participantLeft", watchParticipantLeft(state)), call.on("participantUpdated", watchParticipantUpdated(state)), call.on("trackPublished", watchTrackPublished(state)), call.on("trackUnpublished", watchTrackUnpublished(state)), watchAudioLevelChanged(dispatcher, state), watchDominantSpeakerChanged(dispatcher, state), call.on("callGrantsUpdated", watchCallGrantsUpdated(state)), call.on("pinsUpdated", watchPinsUpdated(state)), handleRemoteSoftMute(call)];
  if (call.ringing) {
    eventHandlers.push(registerRingingCallEventHandlers(call));
  }
  return () => {
    eventHandlers.forEach((unsubscribe) => unsubscribe());
  };
};
var registerRingingCallEventHandlers = (call) => {
  const coordinatorRingEvents = {
    "call.accepted": watchCallAccepted(call),
    "call.rejected": watchCallRejected(call)
  };
  const eventHandlers = Object.keys(coordinatorRingEvents).map((event) => {
    const eventName = event;
    return call.on(eventName, coordinatorRingEvents[eventName]);
  });
  return () => {
    eventHandlers.forEach((unsubscribe) => unsubscribe());
  };
};
var DEFAULT_THRESHOLD = 0.35;
var ViewportTracker = class {
  constructor() {
    this.elementHandlerMap = /* @__PURE__ */ new Map();
    this.observer = null;
    this.queueSet = /* @__PURE__ */ new Set();
    this.setViewport = (viewportElement, options) => {
      const cleanup = () => {
        this.observer?.disconnect();
        this.observer = null;
        this.elementHandlerMap.clear();
      };
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const handler = this.elementHandlerMap.get(entry.target);
          handler?.(entry);
        });
      }, __spreadProps(__spreadValues({
        root: viewportElement
      }, options), {
        threshold: options?.threshold ?? DEFAULT_THRESHOLD
      }));
      if (this.queueSet.size) {
        this.queueSet.forEach(([queueElement, queueHandler]) => {
          if (!viewportElement.contains(queueElement)) return;
          this.observer.observe(queueElement);
          this.elementHandlerMap.set(queueElement, queueHandler);
        });
        this.queueSet.clear();
      }
      return cleanup;
    };
    this.observe = (element, handler) => {
      const queueItem = [element, handler];
      const cleanup = () => {
        this.elementHandlerMap.delete(element);
        this.observer?.unobserve(element);
        this.queueSet.delete(queueItem);
      };
      if (this.elementHandlerMap.has(element)) return cleanup;
      if (!this.observer) {
        this.queueSet.add(queueItem);
        return cleanup;
      }
      if (this.observer.root.contains(element)) {
        this.elementHandlerMap.set(element, handler);
        this.observer.observe(element);
      }
      return cleanup;
    };
  }
};
var DEFAULT_VIEWPORT_VISIBILITY_STATE = {
  videoTrack: VisibilityState.UNKNOWN,
  screenShareTrack: VisibilityState.UNKNOWN
};
var globalOverrideKey = Symbol("globalOverrideKey");
var DynascaleManager = class {
  /**
   * Creates a new DynascaleManager instance.
   */
  constructor(callState, speaker) {
    this.viewportTracker = new ViewportTracker();
    this.logger = getLogger(["DynascaleManager"]);
    this.pendingSubscriptionsUpdate = null;
    this.videoTrackSubscriptionOverridesSubject = new BehaviorSubject({});
    this.videoTrackSubscriptionOverrides$ = this.videoTrackSubscriptionOverridesSubject.asObservable();
    this.incomingVideoSettings$ = this.videoTrackSubscriptionOverrides$.pipe(map((overrides) => {
      const _a = overrides, {
        [globalOverrideKey]: globalSettings
      } = _a, participants = __objRest(_a, [
        __restKey(globalOverrideKey)
      ]);
      return {
        enabled: globalSettings?.enabled !== false,
        preferredResolution: globalSettings?.enabled ? globalSettings.dimension : void 0,
        participants: Object.fromEntries(Object.entries(participants).map(([sessionId, participantOverride]) => [sessionId, {
          enabled: participantOverride?.enabled !== false,
          preferredResolution: participantOverride?.enabled ? participantOverride.dimension : void 0
        }])),
        isParticipantVideoEnabled: (sessionId) => overrides[sessionId]?.enabled ?? overrides[globalOverrideKey]?.enabled ?? true
      };
    }), shareReplay(1));
    this.setVideoTrackSubscriptionOverrides = (override, sessionIds) => {
      if (!sessionIds) {
        return setCurrentValue(this.videoTrackSubscriptionOverridesSubject, override ? {
          [globalOverrideKey]: override
        } : {});
      }
      return setCurrentValue(this.videoTrackSubscriptionOverridesSubject, (overrides) => __spreadValues(__spreadValues({}, overrides), Object.fromEntries(sessionIds.map((id) => [id, override]))));
    };
    this.applyTrackSubscriptions = (debounceType = DebounceType.SLOW) => {
      if (this.pendingSubscriptionsUpdate) {
        clearTimeout(this.pendingSubscriptionsUpdate);
      }
      const updateSubscriptions = () => {
        this.pendingSubscriptionsUpdate = null;
        this.sfuClient?.updateSubscriptions(this.trackSubscriptions).catch((err) => {
          this.logger("debug", `Failed to update track subscriptions`, err);
        });
      };
      if (debounceType) {
        this.pendingSubscriptionsUpdate = setTimeout(updateSubscriptions, debounceType);
      } else {
        updateSubscriptions();
      }
    };
    this.trackElementVisibility = (element, sessionId, trackType) => {
      const cleanup = this.viewportTracker.observe(element, (entry) => {
        this.callState.updateParticipant(sessionId, (participant) => {
          const previousVisibilityState = participant.viewportVisibilityState ?? DEFAULT_VIEWPORT_VISIBILITY_STATE;
          const isVisible = entry.isIntersecting || document.fullscreenElement === element ? VisibilityState.VISIBLE : VisibilityState.INVISIBLE;
          return __spreadProps(__spreadValues({}, participant), {
            viewportVisibilityState: __spreadProps(__spreadValues({}, previousVisibilityState), {
              [trackType]: isVisible
            })
          });
        });
      });
      return () => {
        cleanup();
        this.callState.updateParticipant(sessionId, (participant) => {
          const previousVisibilityState = participant.viewportVisibilityState ?? DEFAULT_VIEWPORT_VISIBILITY_STATE;
          return __spreadProps(__spreadValues({}, participant), {
            viewportVisibilityState: __spreadProps(__spreadValues({}, previousVisibilityState), {
              [trackType]: VisibilityState.UNKNOWN
            })
          });
        });
      };
    };
    this.setViewport = (element) => {
      return this.viewportTracker.setViewport(element);
    };
    this.bindVideoElement = (videoElement, sessionId, trackType) => {
      const boundParticipant = this.callState.findParticipantBySessionId(sessionId);
      if (!boundParticipant) return;
      const requestTrackWithDimensions = (debounceType, dimension) => {
        if (dimension && (dimension.width === 0 || dimension.height === 0)) {
          this.logger("debug", `Ignoring 0x0 dimension`, boundParticipant);
          dimension = void 0;
        }
        this.callState.updateParticipantTracks(trackType, {
          [sessionId]: {
            dimension
          }
        });
        this.applyTrackSubscriptions(debounceType);
      };
      const participant$ = this.callState.participants$.pipe(map((participants) => participants.find((participant) => participant.sessionId === sessionId)), takeWhile((participant) => !!participant), distinctUntilChanged(), shareReplay({
        bufferSize: 1,
        refCount: true
      }));
      let viewportVisibilityState;
      const viewportVisibilityStateSubscription = boundParticipant.isLocalParticipant ? null : participant$.pipe(map((p) => p.viewportVisibilityState?.[trackType]), distinctUntilChanged()).subscribe((nextViewportVisibilityState) => {
        if (!viewportVisibilityState) {
          viewportVisibilityState = nextViewportVisibilityState ?? VisibilityState.UNKNOWN;
          return;
        }
        viewportVisibilityState = nextViewportVisibilityState ?? VisibilityState.UNKNOWN;
        if (nextViewportVisibilityState === VisibilityState.INVISIBLE) {
          return requestTrackWithDimensions(DebounceType.MEDIUM, void 0);
        }
        requestTrackWithDimensions(DebounceType.MEDIUM, {
          width: videoElement.clientWidth,
          height: videoElement.clientHeight
        });
      });
      let lastDimensions;
      const resizeObserver = boundParticipant.isLocalParticipant ? null : new ResizeObserver(() => {
        const currentDimensions = {
          width: videoElement.clientWidth,
          height: videoElement.clientHeight
        };
        if (!lastDimensions) {
          lastDimensions = currentDimensions;
          return;
        }
        if (lastDimensions.width === currentDimensions.width && lastDimensions.height === currentDimensions.height || viewportVisibilityState === VisibilityState.INVISIBLE) {
          return;
        }
        const relativeDelta = Math.max(currentDimensions.width / lastDimensions.width, currentDimensions.height / lastDimensions.height);
        const debounceType = relativeDelta > 1.2 ? DebounceType.IMMEDIATE : DebounceType.MEDIUM;
        requestTrackWithDimensions(debounceType, {
          width: videoElement.clientWidth,
          height: videoElement.clientHeight
        });
        lastDimensions = currentDimensions;
      });
      resizeObserver?.observe(videoElement);
      const publishedTracksSubscription = boundParticipant.isLocalParticipant ? null : participant$.pipe(distinctUntilKeyChanged("publishedTracks"), map((p) => trackType === "videoTrack" ? hasVideo(p) : hasScreenShare(p)), distinctUntilChanged()).subscribe((isPublishing) => {
        if (isPublishing) {
          requestTrackWithDimensions(DebounceType.IMMEDIATE, {
            width: videoElement.clientWidth,
            height: videoElement.clientHeight
          });
        } else {
          requestTrackWithDimensions(DebounceType.FAST, void 0);
        }
      });
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.muted = true;
      const streamSubscription = participant$.pipe(distinctUntilKeyChanged(trackType === "videoTrack" ? "videoStream" : "screenShareStream")).subscribe((p) => {
        const source = trackType === "videoTrack" ? p.videoStream : p.screenShareStream;
        if (videoElement.srcObject === source) return;
        videoElement.srcObject = source ?? null;
        if (isSafari() || isFirefox()) {
          setTimeout(() => {
            videoElement.srcObject = source ?? null;
            videoElement.play().catch((e) => {
              this.logger("warn", `Failed to play stream`, e);
            });
          }, 25);
        }
      });
      return () => {
        requestTrackWithDimensions(DebounceType.FAST, void 0);
        viewportVisibilityStateSubscription?.unsubscribe();
        publishedTracksSubscription?.unsubscribe();
        streamSubscription.unsubscribe();
        resizeObserver?.disconnect();
      };
    };
    this.bindAudioElement = (audioElement, sessionId, trackType) => {
      const participant = this.callState.findParticipantBySessionId(sessionId);
      if (!participant || participant.isLocalParticipant) return;
      const participant$ = this.callState.participants$.pipe(map((participants) => participants.find((p) => p.sessionId === sessionId)), takeWhile((p) => !!p), distinctUntilChanged(), shareReplay({
        bufferSize: 1,
        refCount: true
      }));
      const updateMediaStreamSubscription = participant$.pipe(distinctUntilKeyChanged(trackType === "screenShareAudioTrack" ? "screenShareAudioStream" : "audioStream")).subscribe((p) => {
        const source = trackType === "screenShareAudioTrack" ? p.screenShareAudioStream : p.audioStream;
        if (audioElement.srcObject === source) return;
        setTimeout(() => {
          audioElement.srcObject = source ?? null;
          if (audioElement.srcObject) {
            audioElement.play().catch((e) => {
              this.logger("warn", `Failed to play stream`, e);
            });
            const {
              selectedDevice
            } = this.speaker.state;
            if (selectedDevice && "setSinkId" in audioElement) {
              audioElement.setSinkId(selectedDevice);
            }
          }
        });
      });
      const sinkIdSubscription = !("setSinkId" in audioElement) ? null : this.speaker.state.selectedDevice$.subscribe((deviceId) => {
        if (deviceId) {
          audioElement.setSinkId(deviceId);
        }
      });
      const volumeSubscription = combineLatest([this.speaker.state.volume$, participant$.pipe(distinctUntilKeyChanged("audioVolume"))]).subscribe(([volume, p]) => {
        audioElement.volume = p.audioVolume ?? volume;
      });
      audioElement.autoplay = true;
      return () => {
        sinkIdSubscription?.unsubscribe();
        volumeSubscription.unsubscribe();
        updateMediaStreamSubscription.unsubscribe();
      };
    };
    this.callState = callState;
    this.speaker = speaker;
  }
  setSfuClient(sfuClient) {
    this.sfuClient = sfuClient;
  }
  get trackSubscriptions() {
    const subscriptions = [];
    for (const p of this.callState.remoteParticipants) {
      if (p.videoDimension && hasVideo(p)) {
        const override = this.videoTrackSubscriptionOverrides[p.sessionId] ?? this.videoTrackSubscriptionOverrides[globalOverrideKey];
        if (override?.enabled !== false) {
          subscriptions.push({
            userId: p.userId,
            sessionId: p.sessionId,
            trackType: TrackType.VIDEO,
            dimension: override?.dimension ?? p.videoDimension
          });
        }
      }
      if (p.screenShareDimension && hasScreenShare(p)) {
        subscriptions.push({
          userId: p.userId,
          sessionId: p.sessionId,
          trackType: TrackType.SCREEN_SHARE,
          dimension: p.screenShareDimension
        });
      }
      if (hasScreenShareAudio(p)) {
        subscriptions.push({
          userId: p.userId,
          sessionId: p.sessionId,
          trackType: TrackType.SCREEN_SHARE_AUDIO
        });
      }
    }
    return subscriptions;
  }
  get videoTrackSubscriptionOverrides() {
    return getCurrentValue(this.videoTrackSubscriptionOverrides$);
  }
};
var PermissionsContext = class {
  constructor() {
    this.permissions = [];
    this.setPermissions = (permissions) => {
      this.permissions = permissions || [];
    };
    this.setCallSettings = (settings) => {
      this.settings = settings;
    };
    this.hasPermission = (permission) => {
      return this.permissions.includes(permission);
    };
    this.canPublish = (trackType) => {
      switch (trackType) {
        case TrackType.AUDIO:
          return this.hasPermission(OwnCapability.SEND_AUDIO);
        case TrackType.VIDEO:
          return this.hasPermission(OwnCapability.SEND_VIDEO);
        case TrackType.SCREEN_SHARE:
        case TrackType.SCREEN_SHARE_AUDIO:
          return this.hasPermission(OwnCapability.SCREENSHARE);
        case TrackType.UNSPECIFIED:
          return false;
        default:
          ensureExhausted(trackType, "Unknown track type");
      }
    };
    this.canRequest = (permission, settings = this.settings) => {
      if (!settings) return false;
      const {
        audio,
        video,
        screensharing
      } = settings;
      switch (permission) {
        case OwnCapability.SEND_AUDIO:
          return audio.access_request_enabled;
        case OwnCapability.SEND_VIDEO:
          return video.access_request_enabled;
        case OwnCapability.SCREENSHARE:
          return screensharing.access_request_enabled;
        default:
          return false;
      }
    };
  }
};
var CallType = class {
  /**
   * Constructs a new CallType.
   *
   * @param name the name of the call type.
   * @param options the options for the call type.
   */
  constructor(name2, options = {
    sortParticipantsBy: defaultSortPreset
  }) {
    this.name = name2;
    this.options = options;
  }
};
var CallTypesRegistry = class {
  /**
   * Constructs a new CallTypesRegistry.
   *
   * @param callTypes the initial call types to register.
   */
  constructor(callTypes) {
    this.register = (callType) => {
      this.callTypes[callType.name] = callType;
    };
    this.unregister = (name2) => {
      delete this.callTypes[name2];
    };
    this.get = (name2) => {
      if (!this.callTypes[name2]) {
        this.register(new CallType(name2));
      }
      return this.callTypes[name2];
    };
    this.callTypes = callTypes.reduce((acc, callType) => {
      acc[callType.name] = callType;
      return acc;
    }, {});
  }
};
var CallTypes = new CallTypesRegistry([new CallType("default", {
  sortParticipantsBy: defaultSortPreset
}), new CallType("development", {
  sortParticipantsBy: defaultSortPreset
}), new CallType("livestream", {
  sortParticipantsBy: livestreamOrAudioRoomSortPreset
}), new CallType("audio_room", {
  sortParticipantsBy: livestreamOrAudioRoomSortPreset
})]);
var BrowserPermission = class {
  constructor(permission) {
    this.permission = permission;
    this.disposeController = new AbortController();
    this.wasPrompted = false;
    this.listeners = /* @__PURE__ */ new Set();
    this.logger = getLogger(["permissions"]);
    const signal = this.disposeController.signal;
    this.ready = (() => __async(this, null, function* () {
      const assumeGranted = () => {
        this.setState("prompt");
      };
      if (!canQueryPermissions()) {
        return assumeGranted();
      }
      try {
        const status = yield navigator.permissions.query({
          name: permission.queryName
        });
        if (!signal.aborted) {
          this.setState(status.state);
          status.addEventListener("change", () => this.setState(status.state), {
            signal
          });
        }
      } catch (err) {
        this.logger("debug", "Failed to query permission status", err);
        assumeGranted();
      }
    }))();
  }
  dispose() {
    this.state = void 0;
    this.disposeController.abort();
  }
  getState() {
    return __async(this, null, function* () {
      yield this.ready;
      if (!this.state) {
        throw new Error("BrowserPermission instance possibly disposed");
      }
      return this.state;
    });
  }
  prompt() {
    return __async(this, arguments, function* ({
      forcePrompt = false,
      throwOnNotAllowed = false
    } = {}) {
      return yield withoutConcurrency(`permission-prompt-${this.permission.queryName}`, () => __async(this, null, function* () {
        if ((yield this.getState()) !== "prompt" || this.wasPrompted && !forcePrompt) {
          const isGranted = this.state === "granted";
          if (!isGranted && throwOnNotAllowed) {
            throw new Error("Permission was not granted previously, and prompting again is not allowed");
          }
          return isGranted;
        }
        try {
          this.wasPrompted = true;
          this.setState("prompting");
          const stream = yield navigator.mediaDevices.getUserMedia(this.permission.constraints);
          disposeOfMediaStream(stream);
          this.setState("granted");
          return true;
        } catch (e) {
          if (e && typeof e === "object" && "name" in e && (e.name === "NotAllowedError" || e.name === "SecurityError")) {
            this.logger("info", "Browser permission was not granted", {
              permission: this.permission
            });
            this.setState("denied");
            if (throwOnNotAllowed) {
              throw e;
            }
            return false;
          }
          this.logger("error", `Failed to getUserMedia`, {
            error: e,
            permission: this.permission
          });
          this.setState("prompt");
          throw e;
        }
      }));
    });
  }
  listen(cb) {
    this.listeners.add(cb);
    if (this.state) cb(this.state);
    return () => this.listeners.delete(cb);
  }
  asObservable() {
    return this.getStateObservable().pipe(
      // In some browsers, the 'change' event doesn't reliably emit and hence,
      // permissionState stays in 'prompt' state forever.
      // Typically, this happens when a user grants one-time permission.
      // Instead of checking if a permission is granted, we check if it isn't denied
      map((state) => state !== "denied")
    );
  }
  asStateObservable() {
    return this.getStateObservable();
  }
  getIsPromptingObservable() {
    return this.getStateObservable().pipe(map((state) => state === "prompting"));
  }
  getStateObservable() {
    return fromEventPattern((handler) => this.listen(handler), (handler, unlisten) => unlisten());
  }
  setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.listeners.forEach((listener) => listener(state));
    }
  }
};
function canQueryPermissions() {
  return !isReactNative() && typeof navigator !== "undefined" && !!navigator.permissions?.query;
}
var getDevices = (permission, kind) => {
  return from((() => __async(void 0, null, function* () {
    let devices = yield navigator.mediaDevices.enumerateDevices();
    const shouldPromptForBrowserPermission = devices.some((device) => device.kind === kind && device.label === "");
    if (shouldPromptForBrowserPermission && (yield permission.prompt())) {
      devices = yield navigator.mediaDevices.enumerateDevices();
    }
    return devices.filter((device) => device.kind === kind && device.label !== "" && device.deviceId !== "default");
  }))());
};
var checkIfAudioOutputChangeSupported = () => {
  if (typeof document === "undefined") return false;
  const element = document.createElement("audio");
  return "setSinkId" in element;
};
var audioDeviceConstraints = {
  audio: {
    autoGainControl: true,
    noiseSuppression: true,
    echoCancellation: true
  }
};
var videoDeviceConstraints = {
  video: {
    width: 1280,
    height: 720
  }
};
var getAudioBrowserPermission = lazy(() => new BrowserPermission({
  constraints: audioDeviceConstraints,
  queryName: "microphone"
}));
var getVideoBrowserPermission = lazy(() => new BrowserPermission({
  constraints: videoDeviceConstraints,
  queryName: "camera"
}));
var getDeviceChangeObserver = lazy(() => {
  if (!navigator.mediaDevices.addEventListener) return from([]);
  return fromEvent(navigator.mediaDevices, "devicechange").pipe(map(() => void 0), debounceTime(500));
});
var getAudioDevices = lazy(() => {
  return merge(getDeviceChangeObserver(), getAudioBrowserPermission().asObservable()).pipe(startWith(void 0), concatMap(() => getDevices(getAudioBrowserPermission(), "audioinput")), shareReplay(1));
});
var getVideoDevices = lazy(() => {
  return merge(getDeviceChangeObserver(), getVideoBrowserPermission().asObservable()).pipe(startWith(void 0), concatMap(() => getDevices(getVideoBrowserPermission(), "videoinput")), shareReplay(1));
});
var getAudioOutputDevices = lazy(() => {
  return merge(getDeviceChangeObserver(), getAudioBrowserPermission().asObservable()).pipe(startWith(void 0), concatMap(() => getDevices(getAudioBrowserPermission(), "audiooutput")), shareReplay(1));
});
var getStream = (constraints) => __async(void 0, null, function* () {
  const stream = yield navigator.mediaDevices.getUserMedia(constraints);
  if (isFirefox()) {
    navigator.mediaDevices.dispatchEvent(new Event("devicechange"));
  }
  return stream;
});
function isNotFoundOrOverconstrainedError(error) {
  if (!error || typeof error !== "object") {
    return false;
  }
  if ("name" in error && typeof error.name === "string") {
    const name2 = error.name;
    if (["OverconstrainedError", "NotFoundError"].includes(name2)) {
      return true;
    }
  }
  if ("message" in error && typeof error.message === "string") {
    const message = error.message;
    if (message.startsWith("OverconstrainedError")) {
      return true;
    }
  }
  return false;
}
var getAudioStream = (trackConstraints) => __async(void 0, null, function* () {
  const constraints = {
    audio: __spreadValues(__spreadValues({}, audioDeviceConstraints.audio), trackConstraints)
  };
  try {
    yield getAudioBrowserPermission().prompt({
      throwOnNotAllowed: true,
      forcePrompt: true
    });
    return yield getStream(constraints);
  } catch (error) {
    if (isNotFoundOrOverconstrainedError(error) && trackConstraints?.deviceId) {
      const _a = trackConstraints, {
        deviceId
      } = _a, relaxedConstraints = __objRest(_a, [
        "deviceId"
      ]);
      getLogger(["devices"])("warn", "Failed to get audio stream, will try again with relaxed constraints", {
        error,
        constraints,
        relaxedConstraints
      });
      return getAudioStream(relaxedConstraints);
    }
    getLogger(["devices"])("error", "Failed to get audio stream", {
      error,
      constraints
    });
    throw error;
  }
});
var getVideoStream = (trackConstraints) => __async(void 0, null, function* () {
  const constraints = {
    video: __spreadValues(__spreadValues({}, videoDeviceConstraints.video), trackConstraints)
  };
  try {
    yield getVideoBrowserPermission().prompt({
      throwOnNotAllowed: true,
      forcePrompt: true
    });
    return yield getStream(constraints);
  } catch (error) {
    if (isNotFoundOrOverconstrainedError(error) && trackConstraints?.deviceId) {
      const _a = trackConstraints, {
        deviceId
      } = _a, relaxedConstraints = __objRest(_a, [
        "deviceId"
      ]);
      getLogger(["devices"])("warn", "Failed to get video stream, will try again with relaxed constraints", {
        error,
        constraints,
        relaxedConstraints
      });
      return getVideoStream(relaxedConstraints);
    }
    getLogger(["devices"])("error", "Failed to get video stream", {
      error,
      constraints
    });
    throw error;
  }
});
var getScreenShareStream = (options) => __async(void 0, null, function* () {
  try {
    return yield navigator.mediaDevices.getDisplayMedia(__spreadValues({
      video: true,
      audio: {
        channelCount: {
          ideal: 2
        },
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false
      },
      // @ts-expect-error - not present in types yet
      systemAudio: "include"
    }, options));
  } catch (e) {
    getLogger(["devices"])("error", "Failed to get screen share stream", e);
    throw e;
  }
});
var deviceIds$ = typeof navigator !== "undefined" && typeof navigator.mediaDevices !== "undefined" ? getDeviceChangeObserver().pipe(startWith(void 0), concatMap(() => navigator.mediaDevices.enumerateDevices()), shareReplay(1)) : void 0;
var disposeOfMediaStream = (stream) => {
  if (!stream.active) return;
  stream.getTracks().forEach((track) => {
    track.stop();
  });
  if (typeof stream.release === "function") {
    stream.release();
  }
};
var isMobile = () => /Mobi/i.test(navigator.userAgent);
var InputMediaDeviceManager = class {
  constructor(call, state, trackType) {
    this.call = call;
    this.state = state;
    this.trackType = trackType;
    this.stopOnLeave = true;
    this.subscriptions = [];
    this.isTrackStoppedDueToTrackEnd = false;
    this.filters = [];
    this.statusChangeConcurrencyTag = Symbol("statusChangeConcurrencyTag");
    this.filterRegistrationConcurrencyTag = Symbol("filterRegistrationConcurrencyTag");
    this.dispose = () => {
      this.subscriptions.forEach((s) => s());
    };
    this.logger = getLogger([`${TrackType[trackType].toLowerCase()} manager`]);
    if (deviceIds$ && !isReactNative() && (this.trackType === TrackType.AUDIO || this.trackType === TrackType.VIDEO)) {
      this.handleDisconnectedOrReplacedDevices();
    }
  }
  /**
   * Lists the available audio/video devices
   *
   * Note: It prompts the user for a permission to use devices (if not already granted)
   *
   * @returns an Observable that will be updated if a device is connected or disconnected
   */
  listDevices() {
    return this.getDevices();
  }
  /**
   * Returns `true` when this device is in enabled state.
   */
  get enabled() {
    return this.state.status === "enabled";
  }
  /**
   * Starts stream.
   */
  enable() {
    return __async(this, null, function* () {
      this.state.prevStatus = this.state.optimisticStatus;
      if (this.state.optimisticStatus === "enabled") {
        return;
      }
      this.state.setPendingStatus("enabled");
      yield withCancellation(this.statusChangeConcurrencyTag, (signal) => __async(this, null, function* () {
        try {
          yield this.unmuteStream();
          this.state.setStatus("enabled");
        } finally {
          if (!signal.aborted) {
            this.state.setPendingStatus(this.state.status);
          }
        }
      }));
    });
  }
  /**
   * Stops or pauses the stream based on state.disableMode
   * @param {boolean} [forceStop=false] when true, stops the tracks regardless of the state.disableMode
   */
  disable(forceStop = false) {
    return __async(this, null, function* () {
      this.state.prevStatus = this.state.optimisticStatus;
      if (!forceStop && this.state.optimisticStatus === "disabled") {
        return;
      }
      this.state.setPendingStatus("disabled");
      yield withCancellation(this.statusChangeConcurrencyTag, (signal) => __async(this, null, function* () {
        try {
          const stopTracks = forceStop || this.state.disableMode === "stop-tracks";
          yield this.muteStream(stopTracks);
          this.state.setStatus("disabled");
        } finally {
          if (!signal.aborted) {
            this.state.setPendingStatus(this.state.status);
          }
        }
      }));
    });
  }
  /**
   * Returns a promise that resolves when all pe
   */
  statusChangeSettled() {
    return __async(this, null, function* () {
      yield settled(this.statusChangeConcurrencyTag);
    });
  }
  /**
   * If status was previously enabled, it will re-enable the device.
   */
  resume() {
    return __async(this, null, function* () {
      if (this.state.prevStatus === "enabled" && this.state.status !== "enabled") {
        yield this.enable();
      }
    });
  }
  /**
   * If the current device status is disabled, it will enable the device,
   * else it will disable it.
   */
  toggle() {
    return __async(this, null, function* () {
      if (this.state.optimisticStatus === "enabled") {
        return yield this.disable();
      } else {
        return yield this.enable();
      }
    });
  }
  /**
   * Registers a filter that will be applied to the stream.
   *
   * The registered filter will get the existing stream, and it should return
   * a new stream with the applied filter.
   *
   * @param filter the filter to register.
   * @returns MediaStreamFilterRegistrationResult
   */
  registerFilter(filter) {
    const entry = {
      start: filter,
      stop: void 0
    };
    const registered = withoutConcurrency(this.filterRegistrationConcurrencyTag, () => __async(this, null, function* () {
      this.filters.push(entry);
      yield this.applySettingsToStream();
    }));
    return {
      registered,
      unregister: () => withoutConcurrency(this.filterRegistrationConcurrencyTag, () => __async(this, null, function* () {
        entry.stop?.();
        this.filters = this.filters.filter((f) => f !== entry);
        yield this.applySettingsToStream();
      }))
    };
  }
  /**
   * Will set the default constraints for the device.
   *
   * @param constraints the constraints to set.
   */
  setDefaultConstraints(constraints) {
    this.state.setDefaultConstraints(constraints);
  }
  /**
   * Selects a device.
   *
   * Note: This method is not supported in React Native
   * @param deviceId the device id to select.
   */
  select(deviceId) {
    return __async(this, null, function* () {
      if (isReactNative()) {
        throw new Error("This method is not supported in React Native. Please visit https://getstream.io/video/docs/reactnative/core/camera-and-microphone/#speaker-management for reference.");
      }
      const prevDeviceId = this.state.selectedDevice;
      if (deviceId === prevDeviceId) {
        return;
      }
      try {
        this.state.setDevice(deviceId);
        yield this.applySettingsToStream();
      } catch (error) {
        this.state.setDevice(prevDeviceId);
        throw error;
      }
    });
  }
  applySettingsToStream() {
    return __async(this, null, function* () {
      yield withCancellation(this.statusChangeConcurrencyTag, () => __async(this, null, function* () {
        if (this.enabled) {
          yield this.muteStream();
          yield this.unmuteStream();
        }
      }));
    });
  }
  publishStream(stream) {
    return this.call.publish(stream, this.trackType);
  }
  stopPublishStream() {
    return this.call.stopPublish(this.trackType);
  }
  getTracks() {
    return this.state.mediaStream?.getTracks() ?? [];
  }
  muteStream(stopTracks = true) {
    return __async(this, null, function* () {
      const mediaStream = this.state.mediaStream;
      if (!mediaStream) return;
      this.logger("debug", `${stopTracks ? "Stopping" : "Disabling"} stream`);
      if (this.call.state.callingState === CallingState.JOINED) {
        yield this.stopPublishStream();
      }
      this.muteLocalStream(stopTracks);
      const allEnded = this.getTracks().every((t) => t.readyState === "ended");
      if (allEnded) {
        if (typeof mediaStream.release === "function") {
          mediaStream.release();
        }
        this.state.setMediaStream(void 0, void 0);
        this.filters.forEach((entry) => entry.stop?.());
      }
    });
  }
  disableTracks() {
    this.getTracks().forEach((track) => {
      if (track.enabled) track.enabled = false;
    });
  }
  enableTracks() {
    this.getTracks().forEach((track) => {
      if (!track.enabled) track.enabled = true;
    });
  }
  stopTracks() {
    this.getTracks().forEach((track) => {
      if (track.readyState === "live") track.stop();
    });
  }
  muteLocalStream(stopTracks) {
    if (!this.state.mediaStream) {
      return;
    }
    if (stopTracks) {
      this.stopTracks();
    } else {
      this.disableTracks();
    }
  }
  unmuteStream() {
    return __async(this, null, function* () {
      this.logger("debug", "Starting stream");
      let stream;
      let rootStream;
      try {
        if (this.state.mediaStream && this.getTracks().every((t) => t.readyState === "live")) {
          stream = this.state.mediaStream;
          this.enableTracks();
        } else {
          const defaultConstraints = this.state.defaultConstraints;
          const constraints = __spreadProps(__spreadValues({}, defaultConstraints), {
            deviceId: this.state.selectedDevice ? {
              exact: this.state.selectedDevice
            } : void 0
          });
          const chainWith = (parentStream) => (filterStream) => __async(this, null, function* () {
            if (!parentStream) return filterStream;
            const parent = yield parentStream;
            filterStream.getTracks().forEach((track) => {
              const originalStop = track.stop;
              track.stop = function stop() {
                originalStop.call(track);
                parent.getTracks().forEach((parentTrack) => {
                  if (parentTrack.kind === track.kind) {
                    parentTrack.stop();
                  }
                });
              };
            });
            parent.getTracks().forEach((parentTrack) => {
              const handleParentTrackEnded = () => {
                filterStream.getTracks().forEach((track) => {
                  if (parentTrack.kind !== track.kind) return;
                  track.stop();
                  track.dispatchEvent(new Event("ended"));
                });
              };
              parentTrack.addEventListener("ended", handleParentTrackEnded);
              this.subscriptions.push(() => {
                parentTrack.removeEventListener("ended", handleParentTrackEnded);
              });
            });
            return filterStream;
          });
          rootStream = this.getStream(constraints);
          stream = yield this.filters.reduce((parent, entry) => parent.then((inputStream) => {
            const {
              stop,
              output
            } = entry.start(inputStream);
            entry.stop = stop;
            return output;
          }).then(chainWith(parent), (error) => {
            this.logger("warn", "Filter failed to start and will be ignored", error);
            return parent;
          }), rootStream);
        }
        if (this.call.state.callingState === CallingState.JOINED) {
          yield this.publishStream(stream);
        }
        if (this.state.mediaStream !== stream) {
          this.state.setMediaStream(stream, yield rootStream);
          const handleTrackEnded = () => __async(this, null, function* () {
            yield this.statusChangeSettled();
            if (this.enabled) {
              this.isTrackStoppedDueToTrackEnd = true;
              setTimeout(() => {
                this.isTrackStoppedDueToTrackEnd = false;
              }, 2e3);
              yield this.disable();
            }
          });
          const createTrackMuteHandler = (muted) => () => {
            if (!isMobile() || this.trackType !== TrackType.VIDEO) return;
            this.call.notifyTrackMuteState(muted, this.trackType).catch((err) => {
              this.logger("warn", "Error while notifying track mute state", err);
            });
          };
          stream.getTracks().forEach((track) => {
            const muteHandler = createTrackMuteHandler(true);
            const unmuteHandler = createTrackMuteHandler(false);
            track.addEventListener("mute", muteHandler);
            track.addEventListener("unmute", unmuteHandler);
            track.addEventListener("ended", handleTrackEnded);
            this.subscriptions.push(() => {
              track.removeEventListener("mute", muteHandler);
              track.removeEventListener("unmute", unmuteHandler);
              track.removeEventListener("ended", handleTrackEnded);
            });
          });
        }
      } catch (err) {
        if (rootStream) {
          disposeOfMediaStream(yield rootStream);
        }
        throw err;
      }
    });
  }
  get mediaDeviceKind() {
    if (this.trackType === TrackType.AUDIO) {
      return "audioinput";
    }
    if (this.trackType === TrackType.VIDEO) {
      return "videoinput";
    }
    return "";
  }
  handleDisconnectedOrReplacedDevices() {
    this.subscriptions.push(createSubscription(combineLatest([deviceIds$.pipe(pairwise()), this.state.selectedDevice$]), (_0) => __async(this, [_0], function* ([[prevDevices, currentDevices], deviceId]) {
      try {
        if (!deviceId) return;
        yield this.statusChangeSettled();
        let isDeviceDisconnected = false;
        let isDeviceReplaced = false;
        const currentDevice = this.findDevice(currentDevices, deviceId);
        const prevDevice = this.findDevice(prevDevices, deviceId);
        if (!currentDevice && prevDevice) {
          isDeviceDisconnected = true;
        } else if (currentDevice && prevDevice && currentDevice.deviceId === prevDevice.deviceId && currentDevice.groupId !== prevDevice.groupId) {
          isDeviceReplaced = true;
        }
        if (isDeviceDisconnected) {
          yield this.disable();
          yield this.select(void 0);
        }
        if (isDeviceReplaced) {
          if (this.isTrackStoppedDueToTrackEnd && this.state.status === "disabled") {
            yield this.enable();
            this.isTrackStoppedDueToTrackEnd = false;
          } else {
            yield this.applySettingsToStream();
          }
        }
      } catch (err) {
        this.logger("warn", "Unexpected error while handling disconnected or replaced device", err);
      }
    })));
  }
  findDevice(devices, deviceId) {
    const kind = this.mediaDeviceKind;
    return devices.find((d) => d.deviceId === deviceId && d.kind === kind);
  }
};
var InputMediaDeviceManagerState = class {
  /**
   * Constructs new InputMediaDeviceManagerState instance.
   *
   * @param disableMode the disable mode to use.
   * @param permission the BrowserPermission to use for querying.
   * `undefined` means no permission is required.
   */
  constructor(disableMode = "stop-tracks", permission) {
    this.disableMode = disableMode;
    this.statusSubject = new BehaviorSubject(void 0);
    this.optimisticStatusSubject = new BehaviorSubject(void 0);
    this.mediaStreamSubject = new BehaviorSubject(void 0);
    this.selectedDeviceSubject = new BehaviorSubject(void 0);
    this.defaultConstraintsSubject = new BehaviorSubject(void 0);
    this.mediaStream$ = this.mediaStreamSubject.asObservable();
    this.selectedDevice$ = this.selectedDeviceSubject.asObservable().pipe(distinctUntilChanged());
    this.status$ = this.statusSubject.asObservable().pipe(distinctUntilChanged());
    this.optimisticStatus$ = this.optimisticStatusSubject.asObservable().pipe(distinctUntilChanged());
    this.defaultConstraints$ = this.defaultConstraintsSubject.asObservable();
    this.hasBrowserPermission$ = permission ? permission.asObservable().pipe(shareReplay(1)) : of(true);
    this.browserPermissionState$ = permission ? permission.asStateObservable().pipe(shareReplay(1)) : of("prompt");
    this.isPromptingPermission$ = permission ? permission.getIsPromptingObservable().pipe(shareReplay(1)) : of(false);
  }
  /**
   * The device status
   */
  get status() {
    return getCurrentValue(this.status$);
  }
  /**
   * The requested device status. Useful for optimistic UIs
   */
  get optimisticStatus() {
    return getCurrentValue(this.optimisticStatus$);
  }
  /**
   * The currently selected device
   */
  get selectedDevice() {
    return getCurrentValue(this.selectedDevice$);
  }
  /**
   * The current media stream, or `undefined` if the device is currently disabled.
   */
  get mediaStream() {
    return getCurrentValue(this.mediaStream$);
  }
  /**
   * @internal
   * @param status
   */
  setStatus(status) {
    setCurrentValue(this.statusSubject, status);
  }
  /**
   * @internal
   * @param pendingStatus
   */
  setPendingStatus(pendingStatus) {
    setCurrentValue(this.optimisticStatusSubject, pendingStatus);
  }
  /**
   * Updates the `mediaStream` state variable.
   *
   * @internal
   * @param stream the stream to set.
   * @param rootStream the root stream, applicable when filters are used
   * as this is the stream that holds the actual deviceId information.
   */
  setMediaStream(stream, rootStream) {
    setCurrentValue(this.mediaStreamSubject, stream);
    if (rootStream) {
      this.setDevice(this.getDeviceIdFromStream(rootStream));
    }
  }
  /**
   * @internal
   * @param deviceId the device id to set.
   */
  setDevice(deviceId) {
    setCurrentValue(this.selectedDeviceSubject, deviceId);
  }
  /**
   * Gets the default constraints for the device.
   */
  get defaultConstraints() {
    return getCurrentValue(this.defaultConstraints$);
  }
  /**
   * Sets the default constraints for the device.
   *
   * @internal
   * @param constraints the constraints to set.
   */
  setDefaultConstraints(constraints) {
    setCurrentValue(this.defaultConstraintsSubject, constraints);
  }
};
var CameraManagerState = class extends InputMediaDeviceManagerState {
  constructor() {
    super("stop-tracks", getVideoBrowserPermission());
    this.directionSubject = new BehaviorSubject(void 0);
    this.direction$ = this.directionSubject.asObservable().pipe(distinctUntilChanged());
  }
  /**
   * The preferred camera direction
   * front - means the camera facing the user
   * back - means the camera facing the environment
   */
  get direction() {
    return getCurrentValue(this.direction$);
  }
  /**
   * @internal
   */
  setDirection(direction) {
    setCurrentValue(this.directionSubject, direction);
  }
  /**
   * @internal
   */
  setMediaStream(stream, rootStream) {
    super.setMediaStream(stream, rootStream);
    if (stream) {
      const direction = isReactNative() ? this.direction : stream.getVideoTracks()[0]?.getSettings().facingMode === "environment" ? "back" : "front";
      this.setDirection(direction);
    }
  }
  getDeviceIdFromStream(stream) {
    const [track] = stream.getVideoTracks();
    return track?.getSettings().deviceId;
  }
};
var CameraManager = class extends InputMediaDeviceManager {
  /**
   * Constructs a new CameraManager.
   *
   * @param call the call instance.
   */
  constructor(call) {
    super(call, new CameraManagerState(), TrackType.VIDEO);
    this.targetResolution = {
      width: 1280,
      height: 720
    };
  }
  isDirectionSupportedByDevice() {
    return isReactNative() || isMobile();
  }
  /**
   * Select the camera direction.
   *
   * @param direction the direction of the camera to select.
   */
  selectDirection(direction) {
    return __async(this, null, function* () {
      if (this.isDirectionSupportedByDevice()) {
        if (isReactNative()) {
          const videoTrack = this.getTracks()[0];
          if (!videoTrack) {
            this.logger("warn", "No video track found to do direction selection");
            return;
          }
          yield videoTrack.applyConstraints({
            facingMode: direction === "front" ? "user" : "environment"
          });
          this.state.setDirection(direction);
          this.state.setDevice(void 0);
        } else {
          this.state.setDirection(direction);
          this.state.setDevice(void 0);
          this.getTracks().forEach((track) => {
            track.stop();
          });
          yield this.unmuteStream();
        }
      } else {
        this.logger("warn", "Camera direction ignored for desktop devices");
      }
    });
  }
  /**
   * Flips the camera direction: if it's front it will change to back, if it's back, it will change to front.
   *
   * Note: if there is no available camera with the desired direction, this method will do nothing.
   * @returns
   */
  flip() {
    return __async(this, null, function* () {
      const newDirection = this.state.direction === "front" ? "back" : "front";
      yield this.selectDirection(newDirection);
    });
  }
  /**
   * @internal
   */
  selectTargetResolution(resolution) {
    return __async(this, null, function* () {
      this.targetResolution.height = resolution.height;
      this.targetResolution.width = resolution.width;
      if (this.state.optimisticStatus === "enabled") {
        try {
          yield this.statusChangeSettled();
        } catch (error) {
          this.logger("warn", "could not apply target resolution", error);
        }
      }
      if (this.enabled && this.state.mediaStream) {
        const [videoTrack] = this.state.mediaStream.getVideoTracks();
        if (!videoTrack) return;
        const {
          width,
          height
        } = videoTrack.getSettings();
        if (width !== this.targetResolution.width || height !== this.targetResolution.height) {
          yield this.applySettingsToStream();
          this.logger("debug", `${width}x${height} target resolution applied to media stream`);
        }
      }
    });
  }
  /**
   * Applies the video settings to the camera.
   *
   * @param settings the video settings to apply.
   * @param publish whether to publish the stream after applying the settings.
   */
  apply(settings, publish) {
    return __async(this, null, function* () {
      const hasPublishedVideo = !!this.call.state.localParticipant?.videoStream;
      const hasPermission = this.call.permissionsContext.hasPermission(OwnCapability.SEND_AUDIO);
      if (hasPublishedVideo || !hasPermission) return;
      yield this.statusChangeSettled();
      const {
        target_resolution,
        camera_facing,
        camera_default_on
      } = settings;
      yield this.selectTargetResolution(target_resolution);
      if (!this.state.direction && !this.state.selectedDevice) {
        this.state.setDirection(camera_facing === "front" ? "front" : "back");
      }
      if (!publish) return;
      const {
        mediaStream
      } = this.state;
      if (this.enabled && mediaStream) {
        yield this.publishStream(mediaStream);
      } else if (this.state.status === void 0 && camera_default_on) {
        yield this.enable();
      }
    });
  }
  getDevices() {
    return getVideoDevices();
  }
  getStream(constraints) {
    constraints.width = this.targetResolution.width;
    constraints.height = this.targetResolution.height;
    if (!constraints.deviceId && this.state.direction && this.isDirectionSupportedByDevice()) {
      constraints.facingMode = this.state.direction === "front" ? "user" : "environment";
    }
    return getVideoStream(constraints);
  }
};
var MicrophoneManagerState = class extends InputMediaDeviceManagerState {
  constructor(disableMode) {
    super(disableMode, getAudioBrowserPermission());
    this.speakingWhileMutedSubject = new BehaviorSubject(false);
    this.speakingWhileMuted$ = this.speakingWhileMutedSubject.asObservable().pipe(distinctUntilChanged());
  }
  /**
   * `true` if the user's microphone is muted but they'are speaking.
   *
   * This feature is not available in the React Native SDK.
   */
  get speakingWhileMuted() {
    return getCurrentValue(this.speakingWhileMuted$);
  }
  /**
   * @internal
   */
  setSpeakingWhileMuted(isSpeaking) {
    setCurrentValue(this.speakingWhileMutedSubject, isSpeaking);
  }
  getDeviceIdFromStream(stream) {
    const [track] = stream.getAudioTracks();
    return track?.getSettings().deviceId;
  }
};
var DETECTION_FREQUENCY_IN_MS = 500;
var AUDIO_LEVEL_THRESHOLD = 150;
var FFT_SIZE = 128;
var createSoundDetector = (audioStream, onSoundDetectedStateChanged, options = {}) => {
  const {
    detectionFrequencyInMs = DETECTION_FREQUENCY_IN_MS,
    audioLevelThreshold = AUDIO_LEVEL_THRESHOLD,
    fftSize = FFT_SIZE,
    destroyStreamOnStop = true
  } = options;
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  const microphone = audioContext.createMediaStreamSource(audioStream);
  microphone.connect(analyser);
  const intervalId = setInterval(() => {
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const isSoundDetected = data.some((value) => value >= audioLevelThreshold);
    const averagedDataValue = data.reduce((pv, cv) => pv + cv, 0) / data.length;
    const percentage = averagedDataValue > audioLevelThreshold ? 100 : Math.round(averagedDataValue / audioLevelThreshold * 100);
    if (audioStream.getAudioTracks()[0]?.enabled) {
      onSoundDetectedStateChanged({
        isSoundDetected,
        audioLevel: percentage
      });
    } else {
      onSoundDetectedStateChanged({
        isSoundDetected: false,
        audioLevel: 0
      });
    }
  }, detectionFrequencyInMs);
  return function stop() {
    return __async(this, null, function* () {
      clearInterval(intervalId);
      microphone.disconnect();
      analyser.disconnect();
      if (audioContext.state !== "closed") {
        yield audioContext.close();
      }
      if (destroyStreamOnStop) {
        audioStream.getTracks().forEach((track) => {
          track.stop();
          audioStream.removeTrack(track);
        });
      }
    });
  };
};
var RNSpeechDetector = class {
  constructor() {
    this.pc1 = new RTCPeerConnection({});
    this.pc2 = new RTCPeerConnection({});
  }
  /**
   * Starts the speech detection.
   */
  start(onSoundDetectedStateChanged) {
    return __async(this, null, function* () {
      try {
        this.cleanupAudioStream();
        const audioStream = yield navigator.mediaDevices.getUserMedia({
          audio: true
        });
        this.audioStream = audioStream;
        this.pc1.addEventListener("icecandidate", (e) => __async(this, null, function* () {
          yield this.pc2.addIceCandidate(e.candidate);
        }));
        this.pc2.addEventListener("icecandidate", (e) => __async(this, null, function* () {
          yield this.pc1.addIceCandidate(e.candidate);
        }));
        this.pc2.addEventListener("track", (e) => {
          e.streams[0].getTracks().forEach((track) => {
            track._setVolume(0);
          });
        });
        audioStream.getTracks().forEach((track) => this.pc1.addTrack(track, audioStream));
        const offer = yield this.pc1.createOffer({});
        yield this.pc2.setRemoteDescription(offer);
        yield this.pc1.setLocalDescription(offer);
        const answer = yield this.pc2.createAnswer();
        yield this.pc1.setRemoteDescription(answer);
        yield this.pc2.setLocalDescription(answer);
        const unsub = this.onSpeakingDetectedStateChange(onSoundDetectedStateChanged);
        return () => {
          unsub();
          this.stop();
        };
      } catch (error) {
        const logger2 = getLogger(["RNSpeechDetector"]);
        logger2("error", "error handling permissions: ", error);
        return () => {
        };
      }
    });
  }
  /**
   * Stops the speech detection and releases all allocated resources.
   */
  stop() {
    this.pc1.close();
    this.pc2.close();
    this.cleanupAudioStream();
  }
  /**
   * Public method that detects the audio levels and returns the status.
   */
  onSpeakingDetectedStateChange(onSoundDetectedStateChanged) {
    const initialBaselineNoiseLevel = 0.13;
    let baselineNoiseLevel = initialBaselineNoiseLevel;
    let speechDetected = false;
    let speechTimer;
    let silenceTimer;
    const audioLevelHistory = [];
    const historyLength = 10;
    const silenceThreshold = 1.1;
    const resetThreshold = 0.9;
    const speechTimeout = 500;
    const silenceTimeout = 5e3;
    const checkAudioLevel = () => __async(this, null, function* () {
      try {
        const stats = yield this.pc1.getStats();
        const report = flatten(stats);
        const audioMediaSourceStats = report.find((stat) => stat.type === "media-source" && stat.kind === "audio");
        if (audioMediaSourceStats) {
          const {
            audioLevel
          } = audioMediaSourceStats;
          if (audioLevel) {
            audioLevelHistory.push(audioLevel);
            if (audioLevelHistory.length > historyLength) {
              audioLevelHistory.shift();
            }
            const avgAudioLevel = audioLevelHistory.reduce((a, b) => a + b, 0) / audioLevelHistory.length;
            if (avgAudioLevel < baselineNoiseLevel * silenceThreshold) {
              if (!silenceTimer) {
                silenceTimer = setTimeout(() => {
                  baselineNoiseLevel = Math.min(avgAudioLevel * resetThreshold, initialBaselineNoiseLevel);
                }, silenceTimeout);
              }
            } else {
              clearTimeout(silenceTimer);
              silenceTimer = void 0;
            }
            if (avgAudioLevel > baselineNoiseLevel * 1.5) {
              if (!speechDetected) {
                speechDetected = true;
                onSoundDetectedStateChanged({
                  isSoundDetected: true,
                  audioLevel
                });
              }
              clearTimeout(speechTimer);
              speechTimer = setTimeout(() => {
                speechDetected = false;
                onSoundDetectedStateChanged({
                  isSoundDetected: false,
                  audioLevel: 0
                });
              }, speechTimeout);
            }
          }
        }
      } catch (error) {
        const logger2 = getLogger(["RNSpeechDetector"]);
        logger2("error", "error checking audio level from stats", error);
      }
    });
    const intervalId = setInterval(checkAudioLevel, 100);
    return () => {
      clearInterval(intervalId);
      clearTimeout(speechTimer);
      clearTimeout(silenceTimer);
    };
  }
  cleanupAudioStream() {
    if (!this.audioStream) {
      return;
    }
    this.audioStream.getTracks().forEach((track) => track.stop());
    if (
      // @ts-expect-error release() is present in react-native-webrtc
      typeof this.audioStream.release === "function"
    ) {
      this.audioStream.release();
    }
  }
};
var MicrophoneManager = class extends InputMediaDeviceManager {
  constructor(call, disableMode = "stop-tracks") {
    super(call, new MicrophoneManagerState(disableMode), TrackType.AUDIO);
    this.speakingWhileMutedNotificationEnabled = true;
    this.soundDetectorConcurrencyTag = Symbol("soundDetectorConcurrencyTag");
    this.subscriptions.push(createSafeAsyncSubscription(combineLatest([this.call.state.callingState$, this.call.state.ownCapabilities$, this.state.selectedDevice$, this.state.status$]), (_0) => __async(this, [_0], function* ([callingState, ownCapabilities, deviceId, status]) {
      try {
        if (callingState === CallingState.LEFT) {
          yield this.stopSpeakingWhileMutedDetection();
        }
        if (callingState !== CallingState.JOINED) return;
        if (!this.speakingWhileMutedNotificationEnabled) return;
        if (ownCapabilities.includes(OwnCapability.SEND_AUDIO)) {
          if (status === "disabled") {
            yield this.startSpeakingWhileMutedDetection(deviceId);
          } else {
            yield this.stopSpeakingWhileMutedDetection();
          }
        } else {
          yield this.stopSpeakingWhileMutedDetection();
        }
      } catch (err) {
        this.logger("warn", "Could not enable speaking while muted", err);
      }
    })));
    this.subscriptions.push(createSubscription(this.call.state.callingState$, (callingState) => {
      if (!this.noiseCancellationRegistration || !this.noiseCancellation) return;
      const autoOn = this.call.state.settings?.audio.noise_cancellation?.mode === NoiseCancellationSettingsModeEnum.AUTO_ON;
      if (autoOn && callingState === CallingState.JOINED) {
        this.noiseCancellationRegistration.then(() => this.noiseCancellation?.enable()).catch((err) => {
          this.logger("warn", `Failed to enable noise cancellation`, err);
          return this.call.notifyNoiseCancellationStopped();
        });
      } else if (callingState === CallingState.LEFT) {
        this.noiseCancellationRegistration.then(() => this.noiseCancellation?.disable()).catch((err) => {
          this.logger("warn", `Failed to disable noise cancellation`, err);
        });
      }
    }));
  }
  /**
   * Enables noise cancellation for the microphone.
   *
   * Note: not supported in React Native.
   * @param noiseCancellation - a noise cancellation instance to use.
   */
  enableNoiseCancellation(noiseCancellation) {
    return __async(this, null, function* () {
      if (isReactNative()) {
        throw new Error("Noise cancellation is not supported in React Native");
      }
      const {
        ownCapabilities,
        settings
      } = this.call.state;
      const hasNoiseCancellationCapability = ownCapabilities.includes(OwnCapability.ENABLE_NOISE_CANCELLATION);
      if (!hasNoiseCancellationCapability) {
        throw new Error("Noise cancellation is not available.");
      }
      const noiseCancellationSettings = settings?.audio.noise_cancellation;
      if (!noiseCancellationSettings || noiseCancellationSettings.mode === NoiseCancellationSettingsModeEnum.DISABLED) {
        throw new Error("Noise cancellation is disabled for this call type.");
      }
      try {
        this.noiseCancellation = noiseCancellation;
        this.noiseCancellationChangeUnsubscribe = this.noiseCancellation.on("change", (enabled) => {
          if (enabled) {
            this.call.notifyNoiseCancellationStarting().catch((err) => {
              this.logger("warn", `notifyNoiseCancellationStart failed`, err);
            });
          } else {
            this.call.notifyNoiseCancellationStopped().catch((err) => {
              this.logger("warn", `notifyNoiseCancellationStop failed`, err);
            });
          }
        });
        const registrationResult = this.registerFilter(noiseCancellation.toFilter());
        this.noiseCancellationRegistration = registrationResult.registered;
        this.unregisterNoiseCancellation = registrationResult.unregister;
        yield this.noiseCancellationRegistration;
        if (noiseCancellationSettings.mode === NoiseCancellationSettingsModeEnum.AUTO_ON && this.call.state.callingState === CallingState.JOINED) {
          noiseCancellation.enable();
        }
      } catch (e) {
        this.logger("warn", "Failed to enable noise cancellation", e);
        yield this.disableNoiseCancellation().catch((err) => {
          this.logger("warn", "Failed to disable noise cancellation", err);
        });
      }
    });
  }
  /**
   * Disables noise cancellation for the microphone.
   *
   * Note: not supported in React Native.
   */
  disableNoiseCancellation() {
    return __async(this, null, function* () {
      if (isReactNative()) {
        throw new Error("Noise cancellation is not supported in React Native");
      }
      yield (this.unregisterNoiseCancellation?.() ?? Promise.resolve()).then(() => this.noiseCancellation?.disable()).then(() => this.noiseCancellationChangeUnsubscribe?.()).catch((err) => {
        this.logger("warn", "Failed to unregister noise cancellation", err);
      });
      yield this.call.notifyNoiseCancellationStopped();
    });
  }
  /**
   * Enables speaking while muted notification.
   */
  enableSpeakingWhileMutedNotification() {
    return __async(this, null, function* () {
      this.speakingWhileMutedNotificationEnabled = true;
      if (this.state.status === "disabled") {
        yield this.startSpeakingWhileMutedDetection(this.state.selectedDevice);
      }
    });
  }
  /**
   * Disables speaking while muted notification.
   */
  disableSpeakingWhileMutedNotification() {
    return __async(this, null, function* () {
      this.speakingWhileMutedNotificationEnabled = false;
      yield this.stopSpeakingWhileMutedDetection();
    });
  }
  /**
   * Applies the audio settings to the microphone.
   * @param settings the audio settings to apply.
   * @param publish whether to publish the stream after applying the settings.
   */
  apply(settings, publish) {
    return __async(this, null, function* () {
      if (!publish) return;
      const hasPublishedAudio = !!this.call.state.localParticipant?.audioStream;
      const hasPermission = this.call.permissionsContext.hasPermission(OwnCapability.SEND_AUDIO);
      if (hasPublishedAudio || !hasPermission) return;
      yield this.statusChangeSettled();
      const {
        mediaStream
      } = this.state;
      if (this.enabled && mediaStream) {
        yield this.publishStream(mediaStream);
      } else if (this.state.status === void 0 && settings.mic_default_on) {
        yield this.enable();
      }
    });
  }
  getDevices() {
    return getAudioDevices();
  }
  getStream(constraints) {
    return getAudioStream(constraints);
  }
  startSpeakingWhileMutedDetection(deviceId) {
    return __async(this, null, function* () {
      yield withoutConcurrency(this.soundDetectorConcurrencyTag, () => __async(this, null, function* () {
        yield this.stopSpeakingWhileMutedDetection();
        if (isReactNative()) {
          this.rnSpeechDetector = new RNSpeechDetector();
          const unsubscribe = yield this.rnSpeechDetector.start((event) => {
            this.state.setSpeakingWhileMuted(event.isSoundDetected);
          });
          this.soundDetectorCleanup = () => {
            unsubscribe();
            this.rnSpeechDetector = void 0;
          };
        } else {
          const stream = yield this.getStream({
            deviceId: {
              exact: deviceId
            }
          });
          this.soundDetectorCleanup = createSoundDetector(stream, (event) => {
            this.state.setSpeakingWhileMuted(event.isSoundDetected);
          });
        }
      }));
    });
  }
  stopSpeakingWhileMutedDetection() {
    return __async(this, null, function* () {
      yield withoutConcurrency(this.soundDetectorConcurrencyTag, () => __async(this, null, function* () {
        if (!this.soundDetectorCleanup) return;
        const soundDetectorCleanup = this.soundDetectorCleanup;
        this.soundDetectorCleanup = void 0;
        this.state.setSpeakingWhileMuted(false);
        yield soundDetectorCleanup();
      }));
    });
  }
};
var ScreenShareState = class extends InputMediaDeviceManagerState {
  constructor() {
    super(...arguments);
    this.audioEnabledSubject = new BehaviorSubject(true);
    this.settingsSubject = new BehaviorSubject(void 0);
    this.audioEnabled$ = this.audioEnabledSubject.asObservable().pipe(distinctUntilChanged());
    this.settings$ = this.settingsSubject.asObservable();
    this.getDeviceIdFromStream = (stream) => {
      const [track] = stream.getTracks();
      return track?.getSettings().deviceId;
    };
  }
  /**
   * The current screen share audio status.
   */
  get audioEnabled() {
    return getCurrentValue(this.audioEnabled$);
  }
  /**
   * Set the current screen share audio status.
   */
  setAudioEnabled(isEnabled) {
    setCurrentValue(this.audioEnabledSubject, isEnabled);
  }
  /**
   * The current screen share settings.
   */
  get settings() {
    return getCurrentValue(this.settings$);
  }
  /**
   * Set the current screen share settings.
   *
   * @param settings the screen share settings to set.
   */
  setSettings(settings) {
    setCurrentValue(this.settingsSubject, settings);
  }
};
var ScreenShareManager = class extends InputMediaDeviceManager {
  constructor(call) {
    super(call, new ScreenShareState(), TrackType.SCREEN_SHARE);
    this.subscriptions.push(createSubscription(call.state.settings$, (settings) => {
      const maybeTargetResolution = settings?.screensharing.target_resolution;
      if (maybeTargetResolution) {
        this.setDefaultConstraints({
          video: {
            width: maybeTargetResolution.width,
            height: maybeTargetResolution.height
          }
        });
      }
    }));
  }
  /**
   * Will enable screen share audio options on supported platforms.
   *
   * Note: for ongoing screen share, audio won't be enabled until you
   * re-publish the screen share stream.
   */
  enableScreenShareAudio() {
    this.state.setAudioEnabled(true);
  }
  /**
   * Will disable screen share audio options on supported platforms.
   */
  disableScreenShareAudio() {
    return __async(this, null, function* () {
      this.state.setAudioEnabled(false);
      if (this.call.publisher?.isPublishing(TrackType.SCREEN_SHARE_AUDIO)) {
        yield this.call.stopPublish(TrackType.SCREEN_SHARE_AUDIO);
      }
    });
  }
  /**
   * Returns the current screen share settings.
   */
  getSettings() {
    return this.state.settings;
  }
  /**
   * Sets the current screen share settings.
   *
   * @param settings the settings to set.
   */
  setSettings(settings) {
    this.state.setSettings(settings);
  }
  getDevices() {
    return of([]);
  }
  getStream(constraints) {
    if (!this.state.audioEnabled) {
      constraints.audio = false;
    }
    return getScreenShareStream(constraints);
  }
  stopPublishStream() {
    return __async(this, null, function* () {
      return this.call.stopPublish(TrackType.SCREEN_SHARE, TrackType.SCREEN_SHARE_AUDIO);
    });
  }
  /**
   * Overrides the default `select` method to throw an error.
   */
  select() {
    return __async(this, null, function* () {
      throw new Error("This method is not supported in for Screen Share");
    });
  }
};
var SpeakerState = class {
  constructor() {
    this.selectedDeviceSubject = new BehaviorSubject("");
    this.volumeSubject = new BehaviorSubject(1);
    this.isDeviceSelectionSupported = checkIfAudioOutputChangeSupported();
    this.selectedDevice$ = this.selectedDeviceSubject.asObservable().pipe(distinctUntilChanged());
    this.volume$ = this.volumeSubject.asObservable().pipe(distinctUntilChanged());
  }
  /**
   * The currently selected device
   *
   * Note: this feature is not supported in React Native
   */
  get selectedDevice() {
    return getCurrentValue(this.selectedDevice$);
  }
  /**
   * The currently selected volume
   *
   * Note: this feature is not supported in React Native
   */
  get volume() {
    return getCurrentValue(this.volume$);
  }
  /**
   * @internal
   * @param deviceId
   */
  setDevice(deviceId) {
    setCurrentValue(this.selectedDeviceSubject, deviceId);
    tracer.trace("navigator.mediaDevices.setSinkId", deviceId);
  }
  /**
   * @internal
   * @param volume
   */
  setVolume(volume) {
    setCurrentValue(this.volumeSubject, volume);
  }
};
var SpeakerManager = class {
  constructor(call) {
    this.state = new SpeakerState();
    this.subscriptions = [];
    this.dispose = () => {
      this.subscriptions.forEach((s) => s.unsubscribe());
    };
    this.call = call;
    if (deviceIds$ && !isReactNative()) {
      this.subscriptions.push(combineLatest([deviceIds$, this.state.selectedDevice$]).subscribe(([devices, deviceId]) => {
        if (!deviceId) {
          return;
        }
        const device = devices.find((d) => d.deviceId === deviceId && d.kind === "audiooutput");
        if (!device) {
          this.select("");
        }
      }));
    }
  }
  /**
   * Lists the available audio output devices
   *
   * Note: It prompts the user for a permission to use devices (if not already granted)
   * Note: This method is not supported in React Native
   *
   * @returns an Observable that will be updated if a device is connected or disconnected
   */
  listDevices() {
    if (isReactNative()) {
      throw new Error("This feature is not supported in React Native. Please visit https://getstream.io/video/docs/reactnative/core/camera-and-microphone/#speaker-management for more details");
    }
    return getAudioOutputDevices();
  }
  /**
   * Select a device.
   *
   * Note: This method is not supported in React Native
   *
   * @param deviceId empty string means the system default
   */
  select(deviceId) {
    if (isReactNative()) {
      throw new Error("This feature is not supported in React Native. Please visit https://getstream.io/video/docs/reactnative/core/camera-and-microphone/#speaker-management for more details");
    }
    this.state.setDevice(deviceId);
  }
  /**
   * Set the volume of the audio elements
   * @param volume a number between 0 and 1.
   *
   * Note: This method is not supported in React Native
   */
  setVolume(volume) {
    if (isReactNative()) {
      throw new Error("This feature is not supported in React Native. Please visit https://getstream.io/video/docs/reactnative/core/camera-and-microphone/#speaker-management for more details");
    }
    if (volume && (volume < 0 || volume > 1)) {
      throw new Error("Volume must be between 0 and 1");
    }
    this.state.setVolume(volume);
  }
  /**
   * Set the volume of a participant.
   *
   * Note: This method is not supported in React Native.
   *
   * @param sessionId the participant's session id.
   * @param volume a number between 0 and 1. Set it to `undefined` to use the default volume.
   */
  setParticipantVolume(sessionId, volume) {
    if (isReactNative()) {
      throw new Error("This feature is not supported in React Native. Please visit https://getstream.io/video/docs/reactnative/core/camera-and-microphone/#speaker-management for more details");
    }
    if (volume && (volume < 0 || volume > 1)) {
      throw new Error("Volume must be between 0 and 1, or undefined");
    }
    this.call.state.updateParticipant(sessionId, {
      audioVolume: volume
    });
  }
};
var Call = class {
  /**
   * Constructs a new `Call` instance.
   *
   * NOTE: Don't call the constructor directly, instead
   * Use the [`StreamVideoClient.call`](./StreamVideoClient.md/#call)
   * method to construct a `Call` instance.
   */
  constructor({
    type,
    id,
    streamClient,
    members,
    ownCapabilities,
    sortParticipantsBy,
    clientStore,
    ringing = false,
    watching = false
  }) {
    this.state = new CallState();
    this.permissionsContext = new PermissionsContext();
    this.dispatcher = new Dispatcher();
    this.sfuClientTag = 0;
    this.reconnectConcurrencyTag = Symbol("reconnectConcurrencyTag");
    this.reconnectAttempts = 0;
    this.reconnectStrategy = WebsocketReconnectStrategy.UNSPECIFIED;
    this.reconnectReason = "";
    this.fastReconnectDeadlineSeconds = 0;
    this.disconnectionTimeoutSeconds = 0;
    this.lastOfflineTimestamp = 0;
    this.trackPublishOrder = [];
    this.hasJoinedOnce = false;
    this.deviceSettingsAppliedOnce = false;
    this.initialized = false;
    this.joinLeaveConcurrencyTag = Symbol("joinLeaveConcurrencyTag");
    this.leaveCallHooks = /* @__PURE__ */ new Set();
    this.streamClientEventHandlers = /* @__PURE__ */ new Map();
    this.setup = () => __async(this, null, function* () {
      yield withoutConcurrency(this.joinLeaveConcurrencyTag, () => __async(this, null, function* () {
        if (this.initialized) return;
        this.leaveCallHooks.add(this.on("all", (event) => {
          this.state.updateFromEvent(event);
        }));
        this.leaveCallHooks.add(this.on("changePublishOptions", (event) => {
          this.currentPublishOptions = event.publishOptions;
        }));
        this.leaveCallHooks.add(registerEventHandlers(this, this.dispatcher));
        this.registerEffects();
        this.registerReconnectHandlers();
        if (this.state.callingState === CallingState.LEFT) {
          this.state.setCallingState(CallingState.IDLE);
        }
        this.initialized = true;
      }));
    });
    this.registerEffects = () => {
      this.leaveCallHooks.add(
        // handles updating the permissions context when the settings change.
        createSubscription(this.state.settings$, (settings) => {
          if (!settings) return;
          this.permissionsContext.setCallSettings(settings);
        })
      );
      this.leaveCallHooks.add(
        // handle the case when the user permissions are modified.
        createSafeAsyncSubscription(this.state.ownCapabilities$, this.handleOwnCapabilitiesUpdated)
      );
      this.leaveCallHooks.add(
        // handles the case when the user is blocked by the call owner.
        createSubscription(this.state.blockedUserIds$, (blockedUserIds) => __async(this, null, function* () {
          if (!blockedUserIds || blockedUserIds.length === 0) return;
          const currentUserId = this.currentUserId;
          if (currentUserId && blockedUserIds.includes(currentUserId)) {
            this.logger("info", "Leaving call because of being blocked");
            yield this.leave({
              message: "user blocked"
            }).catch((err) => {
              this.logger("error", "Error leaving call after being blocked", err);
            });
          }
        }))
      );
      this.leaveCallHooks.add(
        // cancel auto-drop when call is accepted or rejected
        createSubscription(this.state.session$, (session) => {
          if (!this.ringing) return;
          const receiverId = this.clientStore.connectedUser?.id;
          if (!receiverId) return;
          const isAcceptedByMe = Boolean(session?.accepted_by[receiverId]);
          const isRejectedByMe = Boolean(session?.rejected_by[receiverId]);
          if (isAcceptedByMe || isRejectedByMe) {
            this.cancelAutoDrop();
          }
          const isAcceptedElsewhere = isAcceptedByMe && this.state.callingState === CallingState.RINGING;
          if ((isAcceptedElsewhere || isRejectedByMe) && !hasPending(this.joinLeaveConcurrencyTag)) {
            this.leave().catch(() => {
              this.logger("error", "Could not leave a call that was accepted or rejected elsewhere");
            });
          }
        })
      );
      this.leaveCallHooks.add(
        // "ringing" mode effects and event handlers
        createSubscription(this.ringingSubject, (isRinging) => {
          if (!isRinging) return;
          const callSession = this.state.session;
          const receiver_id = this.clientStore.connectedUser?.id;
          const ended_at = callSession?.ended_at;
          const created_by_id = this.state.createdBy?.id;
          const rejected_by = callSession?.rejected_by;
          const accepted_by = callSession?.accepted_by;
          let leaveCallIdle = false;
          if (ended_at) {
            leaveCallIdle = true;
          } else if (created_by_id && rejected_by) {
            if (rejected_by[created_by_id]) {
              leaveCallIdle = true;
            }
          } else if (receiver_id && rejected_by) {
            if (rejected_by[receiver_id]) {
              leaveCallIdle = true;
            }
          } else if (receiver_id && accepted_by) {
            if (accepted_by[receiver_id]) {
              leaveCallIdle = true;
            }
          }
          if (leaveCallIdle) {
            if (this.state.callingState !== CallingState.IDLE) {
              this.state.setCallingState(CallingState.IDLE);
            }
          } else {
            if (this.state.callingState === CallingState.IDLE) {
              this.state.setCallingState(CallingState.RINGING);
            }
            this.scheduleAutoDrop();
            this.leaveCallHooks.add(registerRingingCallEventHandlers(this));
          }
        })
      );
    };
    this.handleOwnCapabilitiesUpdated = (ownCapabilities2) => __async(this, null, function* () {
      this.permissionsContext.setPermissions(ownCapabilities2);
      if (!this.publisher) return;
      const permissionToTrackType = {
        [OwnCapability.SEND_AUDIO]: TrackType.AUDIO,
        [OwnCapability.SEND_VIDEO]: TrackType.VIDEO,
        [OwnCapability.SCREENSHARE]: TrackType.SCREEN_SHARE
      };
      for (const [permission, trackType] of Object.entries(permissionToTrackType)) {
        const hasPermission = this.permissionsContext.hasPermission(permission);
        if (hasPermission) continue;
        try {
          switch (trackType) {
            case TrackType.AUDIO:
              if (this.microphone.enabled) yield this.microphone.disable();
              break;
            case TrackType.VIDEO:
              if (this.camera.enabled) yield this.camera.disable();
              break;
            case TrackType.SCREEN_SHARE:
              if (this.screenShare.enabled) yield this.screenShare.disable();
              break;
          }
        } catch (err) {
          this.logger("error", `Can't disable mic/camera/screenshare after revoked permissions`, err);
        }
      }
    });
    this.on = (eventName, fn) => {
      if (isSfuEvent(eventName)) {
        return this.dispatcher.on(eventName, fn);
      }
      const offHandler = this.streamClient.on(eventName, (e) => {
        const event = e;
        if (event.call_cid && event.call_cid === this.cid) {
          fn(event);
        }
      });
      this.streamClientEventHandlers.set(fn, offHandler);
      return () => {
        this.off(eventName, fn);
      };
    };
    this.off = (eventName, fn) => {
      if (isSfuEvent(eventName)) {
        return this.dispatcher.off(eventName, fn);
      }
      const registeredOffHandler = this.streamClientEventHandlers.get(fn);
      if (registeredOffHandler) {
        registeredOffHandler();
      }
    };
    this.leave = (..._0) => __async(this, [..._0], function* ({
      reject,
      reason,
      message
    } = {}) {
      yield withoutConcurrency(this.joinLeaveConcurrencyTag, () => __async(this, null, function* () {
        const callingState = this.state.callingState;
        if (callingState === CallingState.LEFT) {
          throw new Error("Cannot leave call that has already been left.");
        }
        if (callingState === CallingState.JOINING) {
          const waitUntilCallJoined = () => {
            return new Promise((resolve) => {
              this.state.callingState$.pipe(takeWhile((state) => state !== CallingState.JOINED, true)).subscribe(() => resolve());
            });
          };
          yield waitUntilCallJoined();
        }
        if (callingState === CallingState.RINGING && reject !== false) {
          if (reject) {
            yield this.reject(reason ?? "decline");
          } else {
            const hasOtherParticipants = this.state.remoteParticipants.length > 0;
            if (this.isCreatedByMe && !hasOtherParticipants) {
              yield this.reject("cancel");
            }
          }
        }
        this.statsReporter?.stop();
        this.statsReporter = void 0;
        this.sfuStatsReporter?.stop();
        this.sfuStatsReporter = void 0;
        this.subscriber?.dispose();
        this.subscriber = void 0;
        this.publisher?.dispose();
        this.publisher = void 0;
        yield this.sfuClient?.leaveAndClose(message ?? reason ?? "user is leaving the call");
        this.sfuClient = void 0;
        this.dynascaleManager.setSfuClient(void 0);
        this.state.setCallingState(CallingState.LEFT);
        this.state.setParticipants([]);
        this.state.dispose();
        this.leaveCallHooks.forEach((hook) => hook());
        this.initialized = false;
        this.hasJoinedOnce = false;
        this.unifiedSessionId = void 0;
        this.ringingSubject.next(false);
        this.cancelAutoDrop();
        this.clientStore.unregisterCall(this);
        this.camera.dispose();
        this.microphone.dispose();
        this.screenShare.dispose();
        this.speaker.dispose();
        const stopOnLeavePromises = [];
        if (this.camera.stopOnLeave) {
          stopOnLeavePromises.push(this.camera.disable(true));
        }
        if (this.microphone.stopOnLeave) {
          stopOnLeavePromises.push(this.microphone.disable(true));
        }
        if (this.screenShare.stopOnLeave) {
          stopOnLeavePromises.push(this.screenShare.disable(true));
        }
        yield Promise.all(stopOnLeavePromises);
      }));
    });
    this.updateFromRingingEvent = (event) => __async(this, null, function* () {
      yield this.setup();
      const {
        created_by,
        settings
      } = event.call;
      const creator = this.state.members.find((m) => m.user.id === created_by.id);
      if (!creator) {
        this.state.setMembers(event.members);
      } else {
        this.state.setMembers([creator, ...event.members]);
      }
      this.state.updateFromCallResponse(event.call);
      this.watching = true;
      this.ringingSubject.next(true);
      const calls = this.clientStore.calls.filter((c) => c.cid !== this.cid);
      this.clientStore.setCalls([this, ...calls]);
      yield this.applyDeviceConfig(settings, false);
    });
    this.get = (params) => __async(this, null, function* () {
      yield this.setup();
      const response = yield this.streamClient.get(this.streamClientBasePath, params);
      this.state.updateFromCallResponse(response.call);
      this.state.setMembers(response.members);
      this.state.setOwnCapabilities(response.own_capabilities);
      if (params?.ring) {
        this.ringingSubject.next(true);
      }
      if (this.streamClient._hasConnectionID()) {
        this.watching = true;
        this.clientStore.registerCall(this);
      }
      yield this.applyDeviceConfig(response.call.settings, false);
      return response;
    });
    this.getOrCreate = (data) => __async(this, null, function* () {
      yield this.setup();
      const response = yield this.streamClient.post(this.streamClientBasePath, data);
      this.state.updateFromCallResponse(response.call);
      this.state.setMembers(response.members);
      this.state.setOwnCapabilities(response.own_capabilities);
      if (data?.ring) {
        this.ringingSubject.next(true);
      }
      if (this.streamClient._hasConnectionID()) {
        this.watching = true;
        this.clientStore.registerCall(this);
      }
      yield this.applyDeviceConfig(response.call.settings, false);
      return response;
    });
    this.create = (data) => __async(this, null, function* () {
      return this.getOrCreate(data);
    });
    this.delete = (..._0) => __async(this, [..._0], function* (data = {}) {
      return this.streamClient.post(`${this.streamClientBasePath}/delete`, data);
    });
    this.ring = () => __async(this, null, function* () {
      return yield this.get({
        ring: true
      });
    });
    this.notify = () => __async(this, null, function* () {
      return yield this.get({
        notify: true
      });
    });
    this.accept = () => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/accept`);
    });
    this.reject = (reason = "decline") => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/reject`, {
        reason
      });
    });
    this.join = (..._0) => __async(this, [..._0], function* (_a = {}) {
      var _b = _a, {
        maxJoinRetries = 3
      } = _b, data = __objRest(_b, [
        "maxJoinRetries"
      ]);
      yield this.setup();
      const callingState = this.state.callingState;
      if ([CallingState.JOINED, CallingState.JOINING].includes(callingState)) {
        throw new Error(`Illegal State: call.join() shall be called only once`);
      }
      this.state.setCallingState(CallingState.JOINING);
      maxJoinRetries = Math.max(maxJoinRetries, 1);
      for (let attempt = 0; attempt < maxJoinRetries; attempt++) {
        try {
          this.logger("trace", `Joining call (${attempt})`, this.cid);
          return yield this.doJoin(data);
        } catch (err) {
          this.logger("warn", `Failed to join call (${attempt})`, this.cid);
          if (attempt === maxJoinRetries - 1) {
            this.state.setCallingState(callingState);
            throw err;
          }
        }
        yield sleep(retryInterval(attempt));
      }
    });
    this.doJoin = (data) => __async(this, null, function* () {
      const connectStartTime = Date.now();
      const callingState = this.state.callingState;
      this.joinCallData = data;
      this.logger("debug", "Starting join flow");
      this.state.setCallingState(CallingState.JOINING);
      const performingMigration = this.reconnectStrategy === WebsocketReconnectStrategy.MIGRATE;
      const performingRejoin = this.reconnectStrategy === WebsocketReconnectStrategy.REJOIN;
      const performingFastReconnect = this.reconnectStrategy === WebsocketReconnectStrategy.FAST;
      let statsOptions = this.sfuStatsReporter?.options;
      if (!this.credentials || !statsOptions || performingRejoin || performingMigration) {
        try {
          const joinResponse = yield this.doJoinRequest(data);
          this.credentials = joinResponse.credentials;
          statsOptions = joinResponse.stats_options;
        } catch (error) {
          const avoidRestoreState = this.state.callingState === CallingState.OFFLINE;
          if (!avoidRestoreState) {
            this.state.setCallingState(callingState);
          }
          throw error;
        }
      }
      const previousSfuClient = this.sfuClient;
      const previousSessionId = previousSfuClient?.sessionId;
      const isWsHealthy = !!previousSfuClient?.isHealthy;
      const sfuClient = performingRejoin || performingMigration || !isWsHealthy ? new StreamSfuClient({
        logTag: String(++this.sfuClientTag),
        dispatcher: this.dispatcher,
        credentials: this.credentials,
        streamClient: this.streamClient,
        enableTracing: statsOptions.enable_rtc_stats,
        // a new session_id is necessary for the REJOIN strategy.
        // we use the previous session_id if available
        sessionId: performingRejoin ? void 0 : previousSessionId,
        onSignalClose: (reason) => this.handleSfuSignalClose(sfuClient, reason)
      }) : previousSfuClient;
      this.sfuClient = sfuClient;
      this.dynascaleManager.setSfuClient(sfuClient);
      const clientDetails = yield getClientDetails();
      if (previousSfuClient !== sfuClient) {
        const [subscriberSdp, publisherSdp] = yield Promise.all([getGenericSdp("recvonly"), getGenericSdp("sendonly")]);
        const isReconnecting = this.reconnectStrategy !== WebsocketReconnectStrategy.UNSPECIFIED;
        const reconnectDetails = isReconnecting ? this.getReconnectDetails(data?.migrating_from, previousSessionId) : void 0;
        const preferredPublishOptions = !isReconnecting ? this.getPreferredPublishOptions() : this.currentPublishOptions || [];
        const preferredSubscribeOptions = !isReconnecting ? this.getPreferredSubscribeOptions() : [];
        try {
          const {
            callState,
            fastReconnectDeadlineSeconds,
            publishOptions
          } = yield sfuClient.join({
            subscriberSdp,
            publisherSdp,
            clientDetails,
            fastReconnect: performingFastReconnect,
            reconnectDetails,
            preferredPublishOptions,
            preferredSubscribeOptions
          });
          this.currentPublishOptions = publishOptions;
          this.fastReconnectDeadlineSeconds = fastReconnectDeadlineSeconds;
          if (callState) {
            this.state.updateFromSfuCallState(callState, sfuClient.sessionId, reconnectDetails);
          }
        } catch (error) {
          this.logger("warn", "Join SFU request failed", error);
          sfuClient.close(StreamSfuClient.ERROR_CONNECTION_UNHEALTHY, "Join request failed, connection considered unhealthy");
          this.state.setCallingState(callingState);
          throw error;
        }
      }
      if (!performingMigration) {
        this.state.setCallingState(CallingState.JOINED);
      }
      this.hasJoinedOnce = true;
      if (performingFastReconnect) {
        yield this.restoreICE(sfuClient, {
          includeSubscriber: false
        });
      } else {
        const connectionConfig = toRtcConfiguration(this.credentials.ice_servers);
        this.initPublisherAndSubscriber({
          sfuClient,
          connectionConfig,
          clientDetails,
          statsOptions,
          publishOptions: this.currentPublishOptions || [],
          closePreviousInstances: !performingMigration
        });
      }
      if (!performingRejoin && !performingFastReconnect && !performingMigration) {
        this.sfuStatsReporter?.sendConnectionTime((Date.now() - connectStartTime) / 1e3);
      }
      if (performingRejoin) {
        const strategy = WebsocketReconnectStrategy[this.reconnectStrategy];
        yield previousSfuClient?.leaveAndClose(`Closing previous WS after reconnect with strategy: ${strategy}`);
      } else if (!isWsHealthy) {
        previousSfuClient?.close(StreamSfuClient.DISPOSE_OLD_SOCKET, "Closing unhealthy WS after reconnect");
      }
      if (!this.deviceSettingsAppliedOnce && this.state.settings) {
        yield this.applyDeviceConfig(this.state.settings, true);
        this.deviceSettingsAppliedOnce = true;
      }
      delete this.joinCallData?.ring;
      delete this.joinCallData?.notify;
      this.reconnectStrategy = WebsocketReconnectStrategy.UNSPECIFIED;
      this.reconnectReason = "";
      this.logger("info", `Joined call ${this.cid}`);
    });
    this.getReconnectDetails = (migratingFromSfuId, previousSessionId) => {
      const strategy = this.reconnectStrategy;
      const performingRejoin = strategy === WebsocketReconnectStrategy.REJOIN;
      const announcedTracks = this.publisher?.getAnnouncedTracksForReconnect() || [];
      return {
        strategy,
        announcedTracks,
        subscriptions: this.dynascaleManager.trackSubscriptions,
        reconnectAttempt: this.reconnectAttempts,
        fromSfuId: migratingFromSfuId || "",
        previousSessionId: performingRejoin ? previousSessionId || "" : "",
        reason: this.reconnectReason
      };
    };
    this.getPreferredPublishOptions = () => {
      const {
        preferredCodec,
        fmtpLine,
        preferredBitrate,
        maxSimulcastLayers
      } = this.clientPublishOptions || {};
      if (!preferredCodec && !preferredBitrate && !maxSimulcastLayers) return [];
      const codec = preferredCodec ? Codec.create({
        name: preferredCodec.split("/").pop(),
        fmtp: fmtpLine
      }) : void 0;
      const preferredPublishOptions = [PublishOption.create({
        trackType: TrackType.VIDEO,
        codec,
        bitrate: preferredBitrate,
        maxSpatialLayers: maxSimulcastLayers
      })];
      const screenShareSettings = this.screenShare.getSettings();
      if (screenShareSettings) {
        preferredPublishOptions.push(PublishOption.create({
          trackType: TrackType.SCREEN_SHARE,
          fps: screenShareSettings.maxFramerate,
          bitrate: screenShareSettings.maxBitrate
        }));
      }
      return preferredPublishOptions;
    };
    this.getPreferredSubscribeOptions = () => {
      const {
        subscriberCodec,
        subscriberFmtpLine
      } = this.clientPublishOptions || {};
      if (!subscriberCodec || !subscriberFmtpLine) return [];
      return [SubscribeOption.create({
        trackType: TrackType.VIDEO,
        codecs: [{
          name: subscriberCodec.split("/").pop(),
          fmtp: subscriberFmtpLine
        }]
      })];
    };
    this.restoreICE = (_0, ..._1) => __async(this, [_0, ..._1], function* (nextSfuClient, opts = {}) {
      const {
        includeSubscriber = true,
        includePublisher = true
      } = opts;
      if (this.subscriber) {
        this.subscriber.setSfuClient(nextSfuClient);
        if (includeSubscriber) {
          yield this.subscriber.restartIce();
        }
      }
      if (this.publisher) {
        this.publisher.setSfuClient(nextSfuClient);
        if (includePublisher) {
          yield this.publisher.restartIce();
        }
      }
    });
    this.initPublisherAndSubscriber = (opts) => {
      const {
        sfuClient,
        connectionConfig,
        clientDetails,
        statsOptions,
        publishOptions,
        closePreviousInstances
      } = opts;
      const {
        enable_rtc_stats: enableTracing
      } = statsOptions;
      if (closePreviousInstances && this.subscriber) {
        this.subscriber.dispose();
      }
      this.subscriber = new Subscriber({
        sfuClient,
        dispatcher: this.dispatcher,
        state: this.state,
        connectionConfig,
        logTag: String(this.sfuClientTag),
        enableTracing,
        onUnrecoverableError: (reason) => {
          this.reconnect(WebsocketReconnectStrategy.REJOIN, reason).catch((err) => {
            this.logger("warn", `[Reconnect] Error reconnecting after a subscriber error: ${reason}`, err);
          });
        }
      });
      const isAnonymous = this.streamClient.user?.type === "anonymous";
      if (!isAnonymous) {
        if (closePreviousInstances && this.publisher) {
          this.publisher.dispose();
        }
        this.publisher = new Publisher({
          sfuClient,
          dispatcher: this.dispatcher,
          state: this.state,
          connectionConfig,
          publishOptions,
          logTag: String(this.sfuClientTag),
          enableTracing,
          onUnrecoverableError: (reason) => {
            this.reconnect(WebsocketReconnectStrategy.REJOIN, reason).catch((err) => {
              this.logger("warn", `[Reconnect] Error reconnecting after a publisher error: ${reason}`, err);
            });
          }
        });
      }
      tracer.setEnabled(enableTracing);
      this.statsReporter?.stop();
      this.statsReporter = createStatsReporter({
        subscriber: this.subscriber,
        publisher: this.publisher,
        state: this.state,
        datacenter: sfuClient.edgeName
      });
      this.sfuStatsReporter?.stop();
      if (statsOptions?.reporting_interval_ms > 0) {
        this.unifiedSessionId ?? (this.unifiedSessionId = sfuClient.sessionId);
        this.sfuStatsReporter = new SfuStatsReporter(sfuClient, {
          clientDetails,
          options: statsOptions,
          subscriber: this.subscriber,
          publisher: this.publisher,
          microphone: this.microphone,
          camera: this.camera,
          state: this.state,
          unifiedSessionId: this.unifiedSessionId
        });
        this.sfuStatsReporter.start();
      }
    };
    this.doJoinRequest = (data) => __async(this, null, function* () {
      const location = yield this.streamClient.getLocationHint();
      const request = __spreadProps(__spreadValues({}, data), {
        location
      });
      const joinResponse = yield this.streamClient.post(`${this.streamClientBasePath}/join`, request);
      this.state.updateFromCallResponse(joinResponse.call);
      this.state.setMembers(joinResponse.members);
      this.state.setOwnCapabilities(joinResponse.own_capabilities);
      if (data?.ring) {
        this.ringingSubject.next(true);
      }
      const isReconnecting = this.reconnectStrategy !== WebsocketReconnectStrategy.UNSPECIFIED;
      if (!isReconnecting && this.ringing && !this.isCreatedByMe) {
        yield this.accept();
      }
      if (this.streamClient._hasConnectionID()) {
        this.watching = true;
        this.clientStore.registerCall(this);
      }
      return joinResponse;
    });
    this.handleSfuSignalClose = (sfuClient, reason) => {
      this.logger("debug", "[Reconnect] SFU signal connection closed");
      const {
        callingState
      } = this.state;
      if (
        // SFU WS closed before we finished current join,
        // no need to schedule reconnecting
        callingState === CallingState.JOINING || // we are already in the process of reconnecting,
        // no need to schedule another one
        callingState === CallingState.RECONNECTING || // SFU WS closed as a result of unsuccessful join,
        // and no further retries need to be made
        callingState === CallingState.IDLE || callingState === CallingState.LEFT
      ) return;
      if (sfuClient.isLeaving || sfuClient.isClosing) return;
      this.reconnect(WebsocketReconnectStrategy.REJOIN, reason).catch((err) => {
        this.logger("warn", "[Reconnect] Error reconnecting", err);
      });
    };
    this.reconnect = (strategy, reason) => __async(this, null, function* () {
      if (this.state.callingState === CallingState.RECONNECTING || this.state.callingState === CallingState.RECONNECTING_FAILED) return;
      return withoutConcurrency(this.reconnectConcurrencyTag, () => __async(this, null, function* () {
        this.logger("info", `[Reconnect] Reconnecting with strategy ${WebsocketReconnectStrategy[strategy]}`);
        const reconnectStartTime = Date.now();
        this.reconnectStrategy = strategy;
        this.reconnectReason = reason;
        do {
          if (this.disconnectionTimeoutSeconds > 0 && (Date.now() - reconnectStartTime) / 1e3 > this.disconnectionTimeoutSeconds) {
            this.logger("warn", "[Reconnect] Stopping reconnection attempts after reaching disconnection timeout");
            this.state.setCallingState(CallingState.RECONNECTING_FAILED);
            return;
          }
          if (this.reconnectStrategy !== WebsocketReconnectStrategy.FAST) {
            this.reconnectAttempts++;
          }
          const current = WebsocketReconnectStrategy[this.reconnectStrategy];
          try {
            yield this.networkAvailableTask?.promise;
            switch (this.reconnectStrategy) {
              case WebsocketReconnectStrategy.UNSPECIFIED:
              case WebsocketReconnectStrategy.DISCONNECT:
                this.logger("debug", `[Reconnect] No-op strategy ${current}`);
                break;
              case WebsocketReconnectStrategy.FAST:
                yield this.reconnectFast();
                break;
              case WebsocketReconnectStrategy.REJOIN:
                yield this.reconnectRejoin();
                break;
              case WebsocketReconnectStrategy.MIGRATE:
                yield this.reconnectMigrate();
                break;
              default:
                ensureExhausted(this.reconnectStrategy, "Unknown reconnection strategy");
                break;
            }
            break;
          } catch (error) {
            if (this.state.callingState === CallingState.OFFLINE) {
              this.logger("trace", `[Reconnect] Can't reconnect while offline, stopping reconnection attempts`);
              break;
            }
            if (error instanceof ErrorFromResponse && error.unrecoverable) {
              this.logger("warn", `[Reconnect] Can't reconnect due to coordinator unrecoverable error`, error);
              this.state.setCallingState(CallingState.RECONNECTING_FAILED);
              return;
            }
            this.logger("warn", `[Reconnect] ${current} (${this.reconnectAttempts}) failed. Attempting with REJOIN`, error);
            yield sleep(500);
            this.reconnectStrategy = WebsocketReconnectStrategy.REJOIN;
          }
        } while (this.state.callingState !== CallingState.JOINED && this.state.callingState !== CallingState.RECONNECTING_FAILED && this.state.callingState !== CallingState.LEFT);
      }));
    });
    this.reconnectFast = () => __async(this, null, function* () {
      const reconnectStartTime = Date.now();
      this.reconnectStrategy = WebsocketReconnectStrategy.FAST;
      this.state.setCallingState(CallingState.RECONNECTING);
      yield this.doJoin(this.joinCallData);
      this.sfuStatsReporter?.sendReconnectionTime(WebsocketReconnectStrategy.FAST, (Date.now() - reconnectStartTime) / 1e3);
    });
    this.reconnectRejoin = () => __async(this, null, function* () {
      const reconnectStartTime = Date.now();
      this.reconnectStrategy = WebsocketReconnectStrategy.REJOIN;
      this.state.setCallingState(CallingState.RECONNECTING);
      yield this.doJoin(this.joinCallData);
      yield this.restorePublishedTracks();
      this.restoreSubscribedTracks();
      this.sfuStatsReporter?.sendReconnectionTime(WebsocketReconnectStrategy.REJOIN, (Date.now() - reconnectStartTime) / 1e3);
    });
    this.reconnectMigrate = () => __async(this, null, function* () {
      const reconnectStartTime = Date.now();
      const currentSfuClient = this.sfuClient;
      if (!currentSfuClient) {
        throw new Error("Cannot migrate without an active SFU client");
      }
      this.reconnectStrategy = WebsocketReconnectStrategy.MIGRATE;
      this.state.setCallingState(CallingState.MIGRATING);
      const currentSubscriber = this.subscriber;
      const currentPublisher = this.publisher;
      currentSubscriber?.detachEventHandlers();
      currentPublisher?.detachEventHandlers();
      const migrationTask = makeSafePromise(currentSfuClient.enterMigration());
      try {
        const currentSfu = currentSfuClient.edgeName;
        yield this.doJoin(__spreadProps(__spreadValues({}, this.joinCallData), {
          migrating_from: currentSfu
        }));
      } finally {
        delete this.joinCallData?.migrating_from;
      }
      yield this.restorePublishedTracks();
      this.restoreSubscribedTracks();
      try {
        yield migrationTask();
        this.state.setCallingState(CallingState.JOINED);
      } finally {
        currentSubscriber?.dispose();
        currentPublisher?.dispose();
        currentSfuClient.close(StreamSfuClient.NORMAL_CLOSURE, "Migrating away");
      }
      this.sfuStatsReporter?.sendReconnectionTime(WebsocketReconnectStrategy.MIGRATE, (Date.now() - reconnectStartTime) / 1e3);
    });
    this.registerReconnectHandlers = () => {
      const unregisterGoAway = this.on("goAway", () => {
        this.reconnect(WebsocketReconnectStrategy.MIGRATE, "goAway").catch((err) => this.logger("warn", "[Reconnect] Error reconnecting", err));
      });
      const unregisterOnError = this.on("error", (e) => {
        const {
          reconnectStrategy: strategy,
          error
        } = e;
        if (strategy === WebsocketReconnectStrategy.UNSPECIFIED) return;
        if (strategy === WebsocketReconnectStrategy.DISCONNECT) {
          this.leave({
            message: "SFU instructed to disconnect"
          }).catch((err) => {
            this.logger("warn", `Can't leave call after disconnect request`, err);
          });
        } else {
          this.reconnect(strategy, error?.message || "SFU Error").catch((err) => {
            this.logger("warn", "[Reconnect] Error reconnecting", err);
          });
        }
      });
      const unregisterNetworkChanged = this.streamClient.on("network.changed", (e) => {
        if (!e.online) {
          this.logger("debug", "[Reconnect] Going offline");
          if (!this.hasJoinedOnce) return;
          this.lastOfflineTimestamp = Date.now();
          const networkAvailableTask = promiseWithResolvers();
          networkAvailableTask.promise.then(() => {
            let strategy = WebsocketReconnectStrategy.FAST;
            if (this.lastOfflineTimestamp) {
              const offline = (Date.now() - this.lastOfflineTimestamp) / 1e3;
              if (offline > this.fastReconnectDeadlineSeconds) {
                strategy = WebsocketReconnectStrategy.REJOIN;
              }
            }
            this.reconnect(strategy, "Going online").catch((err) => {
              this.logger("warn", "[Reconnect] Error reconnecting after going online", err);
            });
          });
          this.networkAvailableTask = networkAvailableTask;
          this.sfuStatsReporter?.stop();
          this.state.setCallingState(CallingState.OFFLINE);
        } else {
          this.logger("debug", "[Reconnect] Going online");
          this.sfuClient?.close(StreamSfuClient.DISPOSE_OLD_SOCKET, "Closing WS to reconnect after going online");
          this.networkAvailableTask?.resolve();
          this.networkAvailableTask = void 0;
          this.sfuStatsReporter?.start();
        }
      });
      this.leaveCallHooks.add(unregisterGoAway).add(unregisterOnError).add(unregisterNetworkChanged);
    };
    this.restorePublishedTracks = () => __async(this, null, function* () {
      for (const trackType of this.trackPublishOrder) {
        let mediaStream;
        switch (trackType) {
          case TrackType.AUDIO:
            mediaStream = this.microphone.state.mediaStream;
            break;
          case TrackType.VIDEO:
            mediaStream = this.camera.state.mediaStream;
            break;
          case TrackType.SCREEN_SHARE:
            mediaStream = this.screenShare.state.mediaStream;
            break;
          case TrackType.SCREEN_SHARE_AUDIO:
          case TrackType.UNSPECIFIED:
            break;
          default:
            ensureExhausted(trackType, "Unknown track type");
            break;
        }
        if (mediaStream) yield this.publish(mediaStream, trackType);
      }
    });
    this.restoreSubscribedTracks = () => {
      const {
        remoteParticipants
      } = this.state;
      if (remoteParticipants.length <= 0) return;
      this.dynascaleManager.applyTrackSubscriptions(void 0);
    };
    this.publishVideoStream = (videoStream) => __async(this, null, function* () {
      yield this.publish(videoStream, TrackType.VIDEO);
    });
    this.publishAudioStream = (audioStream) => __async(this, null, function* () {
      yield this.publish(audioStream, TrackType.AUDIO);
    });
    this.publishScreenShareStream = (screenShareStream) => __async(this, null, function* () {
      yield this.publish(screenShareStream, TrackType.SCREEN_SHARE);
    });
    this.publish = (mediaStream, trackType) => __async(this, null, function* () {
      if (!this.sfuClient) throw new Error(`Call not joined yet.`);
      yield this.sfuClient.joinTask;
      if (!this.permissionsContext.canPublish(trackType)) {
        throw new Error(`No permission to publish ${TrackType[trackType]}`);
      }
      if (!this.publisher) throw new Error("Publisher is not initialized");
      const [track] = isAudioTrackType(trackType) ? mediaStream.getAudioTracks() : mediaStream.getVideoTracks();
      if (!track) {
        throw new Error(`There is no ${TrackType[trackType]} track in the stream`);
      }
      if (track.readyState === "ended") {
        throw new Error(`Can't publish ended tracks.`);
      }
      pushToIfMissing(this.trackPublishOrder, trackType);
      yield this.publisher.publish(track, trackType);
      const trackTypes = [trackType];
      if (trackType === TrackType.SCREEN_SHARE) {
        const [audioTrack] = mediaStream.getAudioTracks();
        if (audioTrack) {
          pushToIfMissing(this.trackPublishOrder, TrackType.SCREEN_SHARE_AUDIO);
          yield this.publisher.publish(audioTrack, TrackType.SCREEN_SHARE_AUDIO);
          trackTypes.push(TrackType.SCREEN_SHARE_AUDIO);
        }
      }
      if (track.kind === "video") {
        this.sfuStatsReporter?.scheduleOne(3e3);
      }
      yield this.updateLocalStreamState(mediaStream, ...trackTypes);
    });
    this.stopPublish = (...trackTypes) => __async(this, null, function* () {
      if (!this.sfuClient || !this.publisher) return;
      this.publisher.stopTracks(...trackTypes);
      yield this.updateLocalStreamState(void 0, ...trackTypes);
    });
    this.updateLocalStreamState = (mediaStream, ...trackTypes) => __async(this, null, function* () {
      if (!this.sfuClient || !this.sfuClient.sessionId) return;
      yield this.notifyTrackMuteState(!mediaStream, ...trackTypes);
      const {
        sessionId
      } = this.sfuClient;
      for (const trackType of trackTypes) {
        const streamStateProp = trackTypeToParticipantStreamKey(trackType);
        if (!streamStateProp) continue;
        this.state.updateParticipant(sessionId, (p) => ({
          publishedTracks: mediaStream ? pushToIfMissing([...p.publishedTracks], trackType) : p.publishedTracks.filter((t) => t !== trackType),
          [streamStateProp]: mediaStream
        }));
      }
    });
    this.updatePublishOptions = (options) => {
      this.logger("warn", "[call.updatePublishOptions]: You are manually overriding the publish options for this call. This is not recommended, and it can cause call stability/compatibility issues. Use with caution.");
      if (this.state.callingState === CallingState.JOINED) {
        this.logger("warn", "Updating publish options after joining the call does not have an effect");
      }
      this.clientPublishOptions = __spreadValues(__spreadValues({}, this.clientPublishOptions), options);
    };
    this.notifyNoiseCancellationStarting = () => __async(this, null, function* () {
      return this.sfuClient?.startNoiseCancellation().catch((err) => {
        this.logger("warn", "Failed to notify start of noise cancellation", err);
      });
    });
    this.notifyNoiseCancellationStopped = () => __async(this, null, function* () {
      return this.sfuClient?.stopNoiseCancellation().catch((err) => {
        this.logger("warn", "Failed to notify stop of noise cancellation", err);
      });
    });
    this.notifyTrackMuteState = (muted, ...trackTypes) => __async(this, null, function* () {
      if (!this.sfuClient) return;
      yield this.sfuClient.updateMuteStates(trackTypes.map((trackType) => ({
        trackType,
        muted
      })));
    });
    this.startReportingStatsFor = (sessionId) => {
      return this.statsReporter?.startReportingStatsFor(sessionId);
    };
    this.stopReportingStatsFor = (sessionId) => {
      return this.statsReporter?.stopReportingStatsFor(sessionId);
    };
    this.resetReaction = (sessionId) => {
      this.state.updateParticipant(sessionId, {
        reaction: void 0
      });
    };
    this.setSortParticipantsBy = (criteria) => {
      return this.state.setSortParticipantsBy(criteria);
    };
    this.sendReaction = (reaction) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/reaction`, reaction);
    });
    this.blockUser = (userId) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/block`, {
        user_id: userId
      });
    });
    this.unblockUser = (userId) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/unblock`, {
        user_id: userId
      });
    });
    this.muteSelf = (type2) => {
      const myUserId = this.currentUserId;
      if (myUserId) {
        return this.muteUser(myUserId, type2);
      }
    };
    this.muteOthers = (type2) => {
      const trackType = muteTypeToTrackType(type2);
      if (!trackType) return;
      const userIdsToMute = [];
      for (const participant of this.state.remoteParticipants) {
        if (participant.publishedTracks.includes(trackType)) {
          userIdsToMute.push(participant.userId);
        }
      }
      if (userIdsToMute.length > 0) {
        return this.muteUser(userIdsToMute, type2);
      }
    };
    this.muteUser = (userId, type2) => {
      return this.streamClient.post(`${this.streamClientBasePath}/mute_users`, {
        user_ids: Array.isArray(userId) ? userId : [userId],
        [type2]: true
      });
    };
    this.muteAllUsers = (type2) => {
      return this.streamClient.post(`${this.streamClientBasePath}/mute_users`, {
        mute_all_users: true,
        [type2]: true
      });
    };
    this.startRecording = (request) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/start_recording`, request ? request : {});
    });
    this.stopRecording = () => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/stop_recording`, {});
    });
    this.startTranscription = (request) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/start_transcription`, request);
    });
    this.stopTranscription = () => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/stop_transcription`);
    });
    this.startClosedCaptions = (options) => __async(this, null, function* () {
      const trx = this.state.setCaptioning(true);
      try {
        return yield this.streamClient.post(`${this.streamClientBasePath}/start_closed_captions`, options);
      } catch (err) {
        trx.rollback();
        throw err;
      }
    });
    this.stopClosedCaptions = (options) => __async(this, null, function* () {
      const trx = this.state.setCaptioning(false);
      try {
        return yield this.streamClient.post(`${this.streamClientBasePath}/stop_closed_captions`, options);
      } catch (err) {
        trx.rollback();
        throw err;
      }
    });
    this.updateClosedCaptionSettings = (config) => {
      this.state.updateClosedCaptionSettings(config);
    };
    this.requestPermissions = (data) => __async(this, null, function* () {
      const {
        permissions
      } = data;
      const canRequestPermissions = permissions.every((permission) => this.permissionsContext.canRequest(permission));
      if (!canRequestPermissions) {
        throw new Error(`You are not allowed to request permissions: ${permissions.join(", ")}`);
      }
      return this.streamClient.post(`${this.streamClientBasePath}/request_permission`, data);
    });
    this.grantPermissions = (userId, permissions) => __async(this, null, function* () {
      return this.updateUserPermissions({
        user_id: userId,
        grant_permissions: permissions
      });
    });
    this.revokePermissions = (userId, permissions) => __async(this, null, function* () {
      return this.updateUserPermissions({
        user_id: userId,
        revoke_permissions: permissions
      });
    });
    this.updateUserPermissions = (data) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/user_permissions`, data);
    });
    this.goLive = (..._0) => __async(this, [..._0], function* (data = {}, params) {
      return this.streamClient.post(`${this.streamClientBasePath}/go_live`, data, params);
    });
    this.stopLive = (..._0) => __async(this, [..._0], function* (data = {}) {
      return this.streamClient.post(`${this.streamClientBasePath}/stop_live`, data);
    });
    this.startHLS = () => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/start_broadcasting`, {});
    });
    this.stopHLS = () => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/stop_broadcasting`, {});
    });
    this.startRTMPBroadcasts = (data) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/rtmp_broadcasts`, data);
    });
    this.stopAllRTMPBroadcasts = () => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/rtmp_broadcasts/stop`);
    });
    this.stopRTMPBroadcast = (name2) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/rtmp_broadcasts/${name2}/stop`);
    });
    this.startFrameRecording = (data) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/start_frame_recording`, data);
    });
    this.stopFrameRecording = () => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/stop_frame_recording`);
    });
    this.update = (updates) => __async(this, null, function* () {
      const response = yield this.streamClient.patch(`${this.streamClientBasePath}`, updates);
      const {
        call,
        members: members2,
        own_capabilities
      } = response;
      this.state.updateFromCallResponse(call);
      this.state.setMembers(members2);
      this.state.setOwnCapabilities(own_capabilities);
      return response;
    });
    this.endCall = () => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/mark_ended`);
    });
    this.pin = (sessionId) => {
      this.state.updateParticipant(sessionId, {
        pin: {
          isLocalPin: true,
          pinnedAt: Date.now()
        }
      });
    };
    this.unpin = (sessionId) => {
      this.state.updateParticipant(sessionId, {
        pin: void 0
      });
    };
    this.pinForEveryone = (request) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/pin`, request);
    });
    this.unpinForEveryone = (request) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/unpin`, request);
    });
    this.queryMembers = (request) => {
      return this.streamClient.post("/call/members", __spreadProps(__spreadValues({}, request || {}), {
        id: this.id,
        type: this.type
      }));
    };
    this.updateCallMembers = (data) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/members`, data);
    });
    this.scheduleAutoDrop = () => {
      this.cancelAutoDrop();
      const settings = this.state.settings;
      if (!settings) return;
      if (this.state.callingState !== CallingState.RINGING) return;
      const timeoutInMs = this.isCreatedByMe ? settings.ring.auto_cancel_timeout_ms : settings.ring.incoming_call_timeout_ms;
      if (timeoutInMs <= 0) return;
      this.dropTimeout = setTimeout(() => {
        if (this.state.callingState !== CallingState.RINGING) return;
        this.leave({
          reject: true,
          reason: "timeout",
          message: `ringing timeout - ${this.isCreatedByMe ? "no one accepted" : `user didn't interact with incoming call screen`}`
        }).catch((err) => {
          this.logger("error", "Failed to drop call", err);
        });
      }, timeoutInMs);
    };
    this.cancelAutoDrop = () => {
      clearTimeout(this.dropTimeout);
      this.dropTimeout = void 0;
    };
    this.queryRecordings = (callSessionId) => __async(this, null, function* () {
      let endpoint = this.streamClientBasePath;
      if (callSessionId) {
        endpoint = `${endpoint}/${callSessionId}`;
      }
      return this.streamClient.get(`${endpoint}/recordings`);
    });
    this.queryTranscriptions = () => __async(this, null, function* () {
      return this.streamClient.get(`${this.streamClientBasePath}/transcriptions`);
    });
    this.getCallStats = (callSessionID) => __async(this, null, function* () {
      const endpoint = `${this.streamClientBasePath}/stats/${callSessionID}`;
      return this.streamClient.get(endpoint);
    });
    this.getCallReport = (callSessionID = "") => __async(this, null, function* () {
      const endpoint = `${this.streamClientBasePath}/report`;
      const params = callSessionID !== "" ? {
        session_id: callSessionID
      } : {};
      return this.streamClient.get(endpoint, params);
    });
    this.submitFeedback = (_0, ..._1) => __async(this, [_0, ..._1], function* (rating, {
      reason,
      custom
    } = {}) {
      const _a = getSdkSignature(yield getClientDetails()), {
        sdkName,
        sdkVersion
      } = _a, platform = __objRest(_a, [
        "sdkName",
        "sdkVersion"
      ]);
      return this.streamClient.post(`${this.streamClientBasePath}/feedback`, {
        rating,
        reason,
        user_session_id: this.sfuClient?.sessionId,
        sdk: sdkName,
        sdk_version: sdkVersion,
        custom: __spreadProps(__spreadValues({}, custom), {
          "x-stream-platform-data": platform
        })
      });
    });
    this.sendCustomEvent = (payload) => __async(this, null, function* () {
      return this.streamClient.post(`${this.streamClientBasePath}/event`, {
        custom: payload
      });
    });
    this.applyDeviceConfig = (settings, publish) => __async(this, null, function* () {
      yield this.camera.apply(settings.video, publish).catch((err) => {
        this.logger("warn", "Camera init failed", err);
      });
      yield this.microphone.apply(settings.audio, publish).catch((err) => {
        this.logger("warn", "Mic init failed", err);
      });
    });
    this.trackElementVisibility = (element, sessionId, trackType) => {
      return this.dynascaleManager.trackElementVisibility(element, sessionId, trackType);
    };
    this.setViewport = (element) => {
      return this.dynascaleManager.setViewport(element);
    };
    this.bindVideoElement = (videoElement, sessionId, trackType) => {
      const unbind = this.dynascaleManager.bindVideoElement(videoElement, sessionId, trackType);
      if (!unbind) return;
      this.leaveCallHooks.add(unbind);
      return () => {
        this.leaveCallHooks.delete(unbind);
        unbind();
      };
    };
    this.bindAudioElement = (audioElement, sessionId, trackType = "audioTrack") => {
      const unbind = this.dynascaleManager.bindAudioElement(audioElement, sessionId, trackType);
      if (!unbind) return;
      this.leaveCallHooks.add(unbind);
      return () => {
        this.leaveCallHooks.delete(unbind);
        unbind();
      };
    };
    this.bindCallThumbnailElement = (imageElement, opts = {}) => {
      const handleError = () => {
        imageElement.src = opts.fallbackImageSource || "https://getstream.io/random_svg/?name=x&id=x";
      };
      const unsubscribe = createSubscription(this.state.thumbnails$, (thumbnails) => {
        if (!thumbnails) return;
        imageElement.addEventListener("error", handleError);
        const thumbnailUrl = new URL(thumbnails.image_url);
        thumbnailUrl.searchParams.set("w", String(imageElement.clientWidth));
        thumbnailUrl.searchParams.set("h", String(imageElement.clientHeight));
        imageElement.src = thumbnailUrl.toString();
      });
      return () => {
        unsubscribe();
        imageElement.removeEventListener("error", handleError);
      };
    };
    this.setPreferredIncomingVideoResolution = (resolution, sessionIds) => {
      this.dynascaleManager.setVideoTrackSubscriptionOverrides(resolution ? {
        enabled: true,
        dimension: resolution
      } : void 0, sessionIds);
      this.dynascaleManager.applyTrackSubscriptions();
    };
    this.setIncomingVideoEnabled = (enabled) => {
      this.dynascaleManager.setVideoTrackSubscriptionOverrides(enabled ? void 0 : {
        enabled: false
      });
      this.dynascaleManager.applyTrackSubscriptions();
    };
    this.setDisconnectionTimeout = (timeoutSeconds) => {
      this.disconnectionTimeoutSeconds = timeoutSeconds;
    };
    this.type = type;
    this.id = id;
    this.cid = `${type}:${id}`;
    this.ringingSubject = new BehaviorSubject(ringing);
    this.watching = watching;
    this.streamClient = streamClient;
    this.clientStore = clientStore;
    this.streamClientBasePath = `/call/${this.type}/${this.id}`;
    this.logger = getLogger(["Call"]);
    const callTypeConfig = CallTypes.get(type);
    const participantSorter = sortParticipantsBy || callTypeConfig.options.sortParticipantsBy;
    if (participantSorter) {
      this.state.setSortParticipantsBy(participantSorter);
    }
    this.state.setMembers(members || []);
    this.state.setOwnCapabilities(ownCapabilities || []);
    this.state.setCallingState(ringing ? CallingState.RINGING : CallingState.IDLE);
    this.camera = new CameraManager(this);
    this.microphone = new MicrophoneManager(this);
    this.speaker = new SpeakerManager(this);
    this.screenShare = new ScreenShareManager(this);
    this.dynascaleManager = new DynascaleManager(this.state, this.speaker);
  }
  /**
   * A flag indicating whether the call is "ringing" type of call.
   */
  get ringing() {
    return getCurrentValue(this.ringingSubject);
  }
  /**
   * Retrieves the current user ID.
   */
  get currentUserId() {
    return this.clientStore.connectedUser?.id;
  }
  /**
   * A flag indicating whether the call was created by the current user.
   */
  get isCreatedByMe() {
    return this.state.createdBy?.id === this.currentUserId;
  }
};
var https = null;
var StableWSConnection = class {
  constructor(client) {
    this._log = (msg, extra = {}, level2 = "info") => {
      this.client.logger(level2, `connection:${msg}`, extra);
    };
    this.setClient = (client2) => {
      this.client = client2;
    };
    this._buildUrl = () => {
      const params = new URLSearchParams();
      params.set("api_key", this.client.key);
      params.set("stream-auth-type", this.client.getAuthType());
      params.set("X-Stream-Client", this.client.getUserAgent());
      return `${this.client.wsBaseURL}/connect?${params.toString()}`;
    };
    this.onlineStatusChanged = (event) => {
      if (event.type === "offline") {
        this._log("onlineStatusChanged() - Status changing to offline");
        this._setHealth(false, true);
      } else if (event.type === "online") {
        this._log(`onlineStatusChanged() - Status changing to online. isHealthy: ${this.isHealthy}`);
        if (!this.isHealthy) {
          this._reconnect({
            interval: 10
          });
        }
      }
    };
    this.onopen = (wsID) => {
      if (this.wsID !== wsID) return;
      const user = this.client.user;
      if (!user) {
        this.client.logger("error", `User not set, can't connect to WS`);
        return;
      }
      const token = this.client._getToken();
      if (!token) {
        this.client.logger("error", `Token not set, can't connect authenticate`);
        return;
      }
      const authMessage = JSON.stringify({
        token,
        user_details: {
          id: user.id,
          name: user.name,
          image: user.image,
          custom: user.custom
        }
      });
      this._log(`onopen() - Sending auth message ${authMessage}`, {}, "trace");
      this.ws?.send(authMessage);
      this._log("onopen() - onopen callback", {
        wsID
      });
    };
    this.onmessage = (wsID, event) => {
      if (this.wsID !== wsID) return;
      this._log("onmessage() - onmessage callback", {
        event,
        wsID
      });
      const data = typeof event.data === "string" ? JSON.parse(event.data) : null;
      if (!this.isConnectionOpenResolved && data && data.type === "connection.error") {
        this.isConnectionOpenResolved = true;
        if (data.error) {
          this.rejectConnectionOpen?.(this._errorFromWSEvent(data, false));
          return;
        }
      }
      this.lastEvent = /* @__PURE__ */ new Date();
      if (data && (data.type === "health.check" || data.type === "connection.ok")) {
        this.scheduleNextPing();
      }
      if (data && data.type === "connection.ok") {
        this.resolveConnectionOpen?.(data);
        this._setHealth(true);
      }
      if (data && data.type === "connection.error" && data.error) {
        const {
          code
        } = data.error;
        this.isHealthy = false;
        this.isConnecting = false;
        this.consecutiveFailures += 1;
        if (code === KnownCodes.TOKEN_EXPIRED && !this.client.tokenManager.isStatic()) {
          clearTimeout(this.connectionCheckTimeoutRef);
          this._log("connect() - WS failure due to expired token, so going to try to reload token and reconnect");
          this._reconnect({
            refreshToken: true
          });
        }
      }
      if (data) {
        data.received_at = /* @__PURE__ */ new Date();
        this.client.dispatchEvent(data);
      }
      this.scheduleConnectionCheck();
    };
    this.onclose = (wsID, event) => {
      if (this.wsID !== wsID) return;
      this._log("onclose() - onclose callback - " + event.code, {
        event,
        wsID
      });
      if (event.code === KnownCodes.WS_CLOSED_SUCCESS) {
        const error = new Error(`WS connection reject with error ${event.reason}`);
        error.reason = event.reason;
        error.code = event.code;
        error.wasClean = event.wasClean;
        error.target = event.target;
        this.rejectConnectionOpen?.(error);
        this._log(`onclose() - WS connection reject with error ${event.reason}`, {
          event
        });
      } else {
        this.consecutiveFailures += 1;
        this.totalFailures += 1;
        this._setHealth(false);
        this.isConnecting = false;
        this.rejectConnectionOpen?.(this._errorFromWSEvent(event));
        this._log(`onclose() - WS connection closed. Calling reconnect ...`, {
          event
        });
        this._reconnect();
      }
    };
    this.onerror = (wsID, event) => {
      if (this.wsID !== wsID) return;
      this.consecutiveFailures += 1;
      this.totalFailures += 1;
      this._setHealth(false);
      this.isConnecting = false;
      this.rejectConnectionOpen?.(new Error(`WebSocket error: ${event}`));
      this._log(`onerror() - WS connection resulted into error`, {
        event
      });
      this._reconnect();
    };
    this._setHealth = (healthy, dispatchImmediately = false) => {
      if (healthy === this.isHealthy) return;
      this.isHealthy = healthy;
      if (this.isHealthy || dispatchImmediately) {
        this.client.dispatchEvent({
          type: "connection.changed",
          online: this.isHealthy
        });
        return;
      }
      setTimeout(() => {
        if (this.isHealthy) return;
        this.client.dispatchEvent({
          type: "connection.changed",
          online: this.isHealthy
        });
      }, 5e3);
    };
    this._errorFromWSEvent = (event, isWSFailure = true) => {
      let code;
      let statusCode;
      let message;
      if (isCloseEvent(event)) {
        code = event.code;
        message = event.reason;
        statusCode = 0;
      } else {
        const {
          error: error2
        } = event;
        code = error2.code;
        message = error2.message;
        statusCode = error2.StatusCode;
      }
      const msg = `WS failed with code: ${code} and reason: ${message}`;
      this._log(msg, {
        event
      }, "warn");
      const error = new Error(msg);
      error.code = code;
      error.StatusCode = statusCode;
      error.isWSFailure = isWSFailure;
      return error;
    };
    this._setupConnectionPromise = () => {
      this.isConnectionOpenResolved = false;
      this.connectionOpenSafe = makeSafePromise(new Promise((resolve, reject) => {
        this.resolveConnectionOpen = resolve;
        this.rejectConnectionOpen = reject;
      }));
    };
    this.scheduleNextPing = () => {
      const timers = getTimers();
      if (this.healthCheckTimeoutRef) {
        timers.clearTimeout(this.healthCheckTimeoutRef);
      }
      this.healthCheckTimeoutRef = timers.setTimeout(() => {
        const data = [{
          type: "health.check",
          client_id: this.client.clientID
        }];
        try {
          this.ws?.send(JSON.stringify(data));
        } catch {
        }
      }, this.pingInterval);
    };
    this.scheduleConnectionCheck = () => {
      clearTimeout(this.connectionCheckTimeoutRef);
      this.connectionCheckTimeoutRef = setTimeout(() => {
        const now = /* @__PURE__ */ new Date();
        if (this.lastEvent && now.getTime() - this.lastEvent.getTime() > this.connectionCheckTimeout) {
          this._log("scheduleConnectionCheck - going to reconnect");
          this._setHealth(false);
          this._reconnect();
        }
      }, this.connectionCheckTimeout);
    };
    this.client = client;
    this.consecutiveFailures = 0;
    this.totalFailures = 0;
    this.isConnecting = false;
    this.isDisconnected = false;
    this.isConnectionOpenResolved = false;
    this.isHealthy = false;
    this.wsID = 1;
    this.lastEvent = null;
    this.pingInterval = 25 * 1e3;
    this.connectionCheckTimeout = this.pingInterval + 10 * 1e3;
    addConnectionEventListeners(this.onlineStatusChanged);
  }
  /**
   * connect - Connect to the WS URL
   * the default 15s timeout allows between 2~3 tries
   * @return {ConnectAPIResponse<ConnectedEvent>} Promise that completes once the first health check message is received
   */
  connect(timeout = 15e3) {
    return __async(this, null, function* () {
      if (this.isConnecting) {
        throw Error(`You've called connect twice, can only attempt 1 connection at the time`);
      }
      this.isDisconnected = false;
      try {
        const healthCheck = yield this._connect();
        this.consecutiveFailures = 0;
        this._log(`connect() - Established ws connection with healthcheck: ${healthCheck}`);
      } catch (error) {
        this.isHealthy = false;
        this.consecutiveFailures += 1;
        if (
          // @ts-expect-error type issue
          error.code === KnownCodes.TOKEN_EXPIRED && !this.client.tokenManager.isStatic()
        ) {
          this._log("connect() - WS failure due to expired token, so going to try to reload token and reconnect");
          this._reconnect({
            refreshToken: true
          });
        } else {
          if (!error.isWSFailure) {
            throw new Error(JSON.stringify({
              // @ts-expect-error type issue
              code: error.code,
              // @ts-expect-error type issue
              StatusCode: error.StatusCode,
              // @ts-expect-error type issue
              message: error.message,
              // @ts-expect-error type issue
              isWSFailure: error.isWSFailure
            }));
          }
        }
      }
      return yield this._waitForHealthy(timeout);
    });
  }
  /**
   * _waitForHealthy polls the promise connection to see if its resolved until it times out
   * the default 15s timeout allows between 2~3 tries
   * @param timeout duration(ms)
   */
  _waitForHealthy(timeout = 15e3) {
    return __async(this, null, function* () {
      return Promise.race([(() => __async(this, null, function* () {
        const interval = 50;
        for (let i = 0; i <= timeout; i += interval) {
          try {
            return yield this.connectionOpen;
          } catch (error) {
            if (i === timeout) {
              throw new Error(JSON.stringify({
                code: error.code,
                StatusCode: error.StatusCode,
                message: error.message,
                isWSFailure: error.isWSFailure
              }));
            }
            yield sleep(interval);
          }
        }
      }))(), (() => __async(this, null, function* () {
        yield sleep(timeout);
        this.isConnecting = false;
        throw new Error(JSON.stringify({
          code: "",
          StatusCode: "",
          message: "initial WS connection could not be established",
          isWSFailure: true
        }));
      }))()]);
    });
  }
  /**
   * disconnect - Disconnect the connection and doesn't recover...
   *
   */
  disconnect(timeout) {
    this._log(`disconnect() - Closing the websocket connection for wsID ${this.wsID}`);
    this.wsID += 1;
    this.isConnecting = false;
    this.isDisconnected = true;
    if (this.healthCheckTimeoutRef) {
      getTimers().clearInterval(this.healthCheckTimeoutRef);
    }
    if (this.connectionCheckTimeoutRef) {
      clearInterval(this.connectionCheckTimeoutRef);
    }
    removeConnectionEventListeners(this.onlineStatusChanged);
    this.isHealthy = false;
    let isClosedPromise;
    const {
      ws
    } = this;
    if (ws && ws.close && ws.readyState === ws.OPEN) {
      isClosedPromise = new Promise((resolve) => {
        const onclose = (event) => {
          this._log(`disconnect() - resolving isClosedPromise ${event ? "with" : "without"} close frame`, {
            event
          });
          resolve();
        };
        ws.onclose = onclose;
        setTimeout(onclose, timeout != null ? timeout : 1e3);
      });
      this._log(`disconnect() - Manually closed connection by calling client.disconnect()`);
      ws.close(KnownCodes.WS_CLOSED_SUCCESS, "Manually closed connection by calling client.disconnect()");
    } else {
      this._log(`disconnect() - ws connection doesn't exist or it is already closed.`);
      isClosedPromise = Promise.resolve();
    }
    delete this.ws;
    return isClosedPromise;
  }
  /**
   * _connect - Connect to the WS endpoint
   *
   * @return {ConnectAPIResponse<ConnectedEvent>} Promise that completes once the first health check message is received
   */
  _connect() {
    return __async(this, null, function* () {
      if (this.isConnecting) return;
      this.isConnecting = true;
      let isTokenReady = false;
      try {
        this._log(`_connect() - waiting for token`);
        yield this.client.tokenManager.tokenReady();
        isTokenReady = true;
      } catch {
      }
      try {
        if (!isTokenReady) {
          this._log(`_connect() - tokenProvider failed before, so going to retry`);
          yield this.client.tokenManager.loadToken();
        }
        if (!this.client.isConnectionIsPromisePending) {
          this.client._setupConnectionIdPromise();
        }
        this._setupConnectionPromise();
        const wsURL = this._buildUrl();
        this._log(`_connect() - Connecting to ${wsURL}`);
        const WS = this.client.options.WebSocketImpl ?? WebSocket;
        this.ws = new WS(wsURL);
        this.ws.onopen = this.onopen.bind(this, this.wsID);
        this.ws.onclose = this.onclose.bind(this, this.wsID);
        this.ws.onerror = this.onerror.bind(this, this.wsID);
        this.ws.onmessage = this.onmessage.bind(this, this.wsID);
        const response = yield this.connectionOpen;
        this.isConnecting = false;
        if (response) {
          this.connectionID = response.connection_id;
          this.client.resolveConnectionId?.(this.connectionID);
          return response;
        }
      } catch (err) {
        this.client._setupConnectionIdPromise();
        this.isConnecting = false;
        this._log(`_connect() - Error - `, err);
        this.client.rejectConnectionId?.(err);
        throw err;
      }
    });
  }
  /**
   * _reconnect - Retry the connection to WS endpoint
   *
   * @param {{ interval?: number; refreshToken?: boolean }} options Following options are available
   *
   * - `interval`	{int}			number of ms that function should wait before reconnecting
   * - `refreshToken` {boolean}	reload/refresh user token be refreshed before attempting reconnection.
   */
  _reconnect() {
    return __async(this, arguments, function* (options = {}) {
      this._log("_reconnect() - Initiating the reconnect");
      if (this.isConnecting || this.isHealthy) {
        this._log("_reconnect() - Abort (1) since already connecting or healthy");
        return;
      }
      let interval = options.interval;
      if (!interval) {
        interval = retryInterval(this.consecutiveFailures);
      }
      yield sleep(interval);
      if (this.isConnecting || this.isHealthy) {
        this._log("_reconnect() - Abort (2) since already connecting or healthy");
        return;
      }
      if (this.isDisconnected) {
        this._log("_reconnect() - Abort (3) since disconnect() is called");
        return;
      }
      this._log("_reconnect() - Destroying current WS connection");
      this._destroyCurrentWSConnection();
      if (options.refreshToken) {
        yield this.client.tokenManager.loadToken();
      }
      try {
        yield this._connect();
        this._log("_reconnect() - Waiting for recoverCallBack");
        this._log("_reconnect() - Finished recoverCallBack");
        this.consecutiveFailures = 0;
      } catch (error) {
        this.isHealthy = false;
        this.consecutiveFailures += 1;
        if (error.code === KnownCodes.TOKEN_EXPIRED && !this.client.tokenManager.isStatic()) {
          this._log("_reconnect() - WS failure due to expired token, so going to try to reload token and reconnect");
          return this._reconnect({
            refreshToken: true
          });
        }
        if (error.isWSFailure) {
          this._log("_reconnect() - WS failure, so going to try to reconnect");
          this._reconnect();
        }
      }
      this._log("_reconnect() - == END ==");
    });
  }
  /**
   * _destroyCurrentWSConnection - Removes the current WS connection
   *
   */
  _destroyCurrentWSConnection() {
    this.wsID += 1;
    try {
      this?.ws?.close();
    } catch {
    }
  }
  get connectionOpen() {
    return this.connectionOpenSafe?.();
  }
};
function getUserFromToken(token) {
  const fragments = token.split(".");
  if (fragments.length !== 3) {
    return "";
  }
  const b64Payload = fragments[1];
  const payload = decodeBase64(b64Payload);
  const data = JSON.parse(payload);
  return data.user_id;
}
var decodeBase64 = (s) => {
  const e = {}, w = String.fromCharCode, L = s.length;
  let i, b = 0, c, x, l = 0, a, r = "";
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (i = 0; i < 64; i++) {
    e[A.charAt(i)] = i;
  }
  for (x = 0; x < L; x++) {
    c = e[s.charAt(x)];
    b = (b << 6) + c;
    l += 6;
    while (l >= 8) {
      if ((a = b >>> (l -= 8) & 255) || x < L - 2) r += w(a);
    }
  }
  return r;
};
var TokenManager = class {
  constructor(secret) {
    this.loadTokenPromise = null;
    this.type = "static";
    this.setTokenOrProvider = (tokenOrProvider, user, isAnonymous) => __async(this, null, function* () {
      this.user = user;
      this.isAnonymous = isAnonymous;
      this.validateToken(tokenOrProvider);
      if (isFunction(tokenOrProvider)) {
        this.tokenProvider = tokenOrProvider;
        this.type = "provider";
      }
      if (typeof tokenOrProvider === "string") {
        this.token = tokenOrProvider;
        this.type = "static";
      }
      yield this.loadToken();
    });
    this.reset = () => {
      this.token = void 0;
      this.tokenProvider = void 0;
      this.type = "static";
      this.user = void 0;
      this.loadTokenPromise = null;
    };
    this.validateToken = (tokenOrProvider) => {
      if (this.user && this.isAnonymous && !tokenOrProvider) return;
      if (!this.secret && !tokenOrProvider) {
        throw new Error("User token can not be empty");
      }
      if (typeof tokenOrProvider !== "string" && !isFunction(tokenOrProvider)) {
        throw new Error("User token should either be a string or a function");
      }
      if (typeof tokenOrProvider === "string") {
        if (this.isAnonymous && tokenOrProvider === "") return;
        const tokenUserId = getUserFromToken(tokenOrProvider);
        if (tokenOrProvider != null && (tokenUserId == null || tokenUserId === "" || !this.isAnonymous && tokenUserId !== this.user.id)) {
          throw new Error("userToken does not have a user_id or is not matching with user.id");
        }
      }
    };
    this.tokenReady = () => this.loadTokenPromise;
    this.loadToken = () => {
      this.loadTokenPromise = new Promise((resolve, reject) => __async(this, null, function* () {
        if (this.type === "static") {
          return resolve(this.token);
        }
        if (this.tokenProvider && typeof this.tokenProvider !== "string") {
          try {
            const token = yield this.tokenProvider();
            this.validateToken(token);
            this.token = token;
          } catch (e) {
            return reject(new Error(`Call to tokenProvider failed with message: ${e}`));
          }
          resolve(this.token);
        }
      }));
      return this.loadTokenPromise;
    };
    this.getToken = () => {
      if (this.token) {
        return this.token;
      }
      if (this.user && !this.token) {
        return this.token;
      }
      throw new Error(`User token is not set. Either client.connectUser wasn't called or client.disconnect was called`);
    };
    this.isStatic = () => this.type === "static";
    this.secret = secret;
  }
};
var getLocationHint = (hintUrl = `https://hint.stream-io-video.com/`, timeout = 2e3, maxAttempts = 3) => __async(void 0, null, function* () {
  const logger2 = getLogger(["location-hint"]);
  let attempt = 0;
  let locationHint = "ERR";
  do {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);
    try {
      const response = yield fetch(hintUrl, {
        method: "HEAD",
        signal: abortController.signal
      });
      const awsPop = response.headers.get("x-amz-cf-pop") || "ERR";
      logger2("debug", `Location header: ${awsPop}`);
      locationHint = awsPop.substring(0, 3);
    } catch (e) {
      logger2("warn", `Failed to get location hint from ${hintUrl}`, e);
      locationHint = "ERR";
    } finally {
      clearTimeout(timeoutId);
    }
  } while (locationHint === "ERR" && ++attempt < maxAttempts);
  return locationHint;
});
var StreamClient = class {
  /**
   * Initialize a client.
   *
   * @param {string} key - the api key
   * @param {StreamClientOptions} [options] - additional options, here you can pass custom options to axios instance
   * @param {string} [options.secret] - the api secret
   * @param {boolean} [options.browser] - enforce the client to be in browser mode
   * @param {boolean} [options.warmUp] - default to false, if true, client will open a connection as soon as possible to speed up following requests
   * @param {Logger} [options.Logger] - custom logger
   * @param {number} [options.timeout] - default to 3000
   * @param {httpsAgent} [options.httpsAgent] - custom httpsAgent, in node it's default to https.agent()
   */
  constructor(key, options) {
    this.listeners = {};
    this.getAuthType = () => {
      return this.anonymous ? "anonymous" : "jwt";
    };
    this.setBaseURL = (baseURL) => {
      this.baseURL = baseURL;
      this.wsBaseURL = this.baseURL.replace("http", "ws").replace(":3030", ":8800");
    };
    this.getLocationHint = (hintUrl, timeout) => __async(this, null, function* () {
      const hint = yield this.locationHint;
      if (!hint || hint === "ERR") {
        this.locationHint = getLocationHint(hintUrl ?? this.options.locationHintUrl, timeout ?? this.options.locationHintTimeout);
        return this.locationHint;
      }
      return hint;
    });
    this._getConnectionID = () => this.wsConnection?.connectionID;
    this._hasConnectionID = () => Boolean(this._getConnectionID());
    this.connectUser = (user, tokenOrProvider) => __async(this, null, function* () {
      if (!user.id) {
        throw new Error('The "id" field on the user is missing');
      }
      if (this.userID === user.id && this.connectUserTask) {
        this.logger("warn", "Consecutive calls to connectUser is detected, ideally you should only call this function once in your app.");
        return this.connectUserTask;
      }
      if (this.userID) {
        throw new Error("Use client.disconnect() before trying to connect as a different user. connectUser was called twice.");
      }
      if ((this.secret || this.node) && !this.options.allowServerSideConnect) {
        this.logger("warn", "Please do not use connectUser server side. Use our @stream-io/node-sdk instead: https://getstream.io/video/docs/api/");
      }
      this.userID = user.id;
      this.anonymous = false;
      yield this.tokenManager.setTokenOrProvider(tokenOrProvider, user, false);
      this._setUser(user);
      this.connectUserTask = this.openConnection();
      try {
        addConnectionEventListeners(this.updateNetworkConnectionStatus);
        return yield this.connectUserTask;
      } catch (err) {
        if (this.persistUserOnConnectionFailure) {
          yield this.closeConnection();
        } else {
          yield this.disconnectUser();
        }
        throw err;
      }
    });
    this._setUser = (user) => {
      this.user = user;
      this.userID = user.id;
      this._user = __spreadValues({}, user);
    };
    this.closeConnection = (timeout) => __async(this, null, function* () {
      yield this.wsConnection?.disconnect(timeout);
    });
    this.openConnection = () => __async(this, null, function* () {
      if (!this.userID) {
        throw Error("UserWithId is not set on client, use client.connectUser or client.connectAnonymousUser instead");
      }
      const wsPromise = this.wsPromiseSafe?.();
      if (this.wsConnection?.isConnecting && wsPromise) {
        this.logger("info", "client:openConnection() - connection already in progress");
        return yield wsPromise;
      }
      if (this.wsConnection?.isHealthy && this._hasConnectionID()) {
        this.logger("info", "client:openConnection() - openConnection called twice, healthy connection already exists");
        return;
      }
      this._setupConnectionIdPromise();
      this.clientID = `${this.userID}--${generateUUIDv4()}`;
      const newWsPromise = this.connect();
      this.wsPromiseSafe = makeSafePromise(newWsPromise);
      return yield newWsPromise;
    });
    this.disconnectUser = (timeout) => __async(this, null, function* () {
      this.logger("info", "client:disconnect() - Disconnecting the client");
      delete this.user;
      delete this._user;
      delete this.userID;
      this.anonymous = false;
      yield this.closeConnection(timeout);
      removeConnectionEventListeners(this.updateNetworkConnectionStatus);
      this.tokenManager.reset();
      this.connectionIdPromiseSafe = void 0;
      this.rejectConnectionId = void 0;
      this.resolveConnectionId = void 0;
    });
    this.connectGuestUser = (user) => __async(this, null, function* () {
      this.guestUserCreatePromise = this.doAxiosRequest("post", "/guest", {
        user
      }, {
        publicEndpoint: true
      });
      const response = yield this.guestUserCreatePromise;
      this.guestUserCreatePromise.finally(() => this.guestUserCreatePromise = void 0);
      return this.connectUser(response.user, response.access_token);
    });
    this.connectAnonymousUser = (user, tokenOrProvider) => __async(this, null, function* () {
      addConnectionEventListeners(this.updateNetworkConnectionStatus);
      this._setupConnectionIdPromise();
      this.anonymous = true;
      yield this.tokenManager.setTokenOrProvider(tokenOrProvider, user, true);
      this._setUser(user);
      this.resolveConnectionId?.();
    });
    this.on = (eventName, callback) => {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      this.logger("debug", `Adding listener for ${eventName} event`);
      this.listeners[eventName]?.push(callback);
      return () => {
        this.off(eventName, callback);
      };
    };
    this.off = (eventName, callback) => {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      this.logger("debug", `Removing listener for ${eventName} event`);
      this.listeners[eventName] = this.listeners[eventName]?.filter((value) => value !== callback);
    };
    this._setupConnectionIdPromise = () => {
      this.connectionIdPromiseSafe = makeSafePromise(new Promise((resolve, reject) => {
        this.resolveConnectionId = resolve;
        this.rejectConnectionId = reject;
      }));
    };
    this._logApiRequest = (type, url, data, config) => {
      if (getLogLevel() !== "trace") return;
      this.logger("trace", `client: ${type} - Request - ${url}`, {
        payload: data,
        config
      });
    };
    this._logApiResponse = (type, url, response) => {
      if (getLogLevel() !== "trace") return;
      this.logger("trace", `client:${type} - Response - url: ${url} > status ${response.status}`, {
        response
      });
    };
    this._logApiError = (type, url, error) => {
      this.logger("error", `client:${type} - Error - url: ${url}`, {
        url,
        error
      });
    };
    this.doAxiosRequest = (_0, _1, _2, ..._3) => __async(this, [_0, _1, _2, ..._3], function* (type, url, data, options2 = {}) {
      if (!options2.publicEndpoint) {
        yield Promise.all([this.tokenManager.tokenReady(), this.guestUserCreatePromise]);
        try {
          yield this.connectionIdPromise;
        } catch {
          yield this.wsConnection?._waitForHealthy();
          yield this.connectionIdPromise;
        }
      }
      const requestConfig = this._enrichAxiosOptions(options2);
      try {
        let response;
        this._logApiRequest(type, url, data, requestConfig);
        switch (type) {
          case "get":
            response = yield this.axiosInstance.get(url, requestConfig);
            break;
          case "delete":
            response = yield this.axiosInstance.delete(url, requestConfig);
            break;
          case "post":
            response = yield this.axiosInstance.post(url, data, requestConfig);
            break;
          case "put":
            response = yield this.axiosInstance.put(url, data, requestConfig);
            break;
          case "patch":
            response = yield this.axiosInstance.patch(url, data, requestConfig);
            break;
          case "options":
            response = yield this.axiosInstance.options(url, requestConfig);
            break;
          default:
            throw new Error("Invalid request type");
        }
        this._logApiResponse(type, url, response);
        this.consecutiveFailures = 0;
        return this.handleResponse(response);
      } catch (e) {
        e.client_request_id = requestConfig.headers?.["x-client-request-id"];
        this.consecutiveFailures += 1;
        if (e.response) {
          this._logApiError(type, url, e.response);
          if (e.response.data.code === KnownCodes.TOKEN_EXPIRED && !this.tokenManager.isStatic()) {
            if (this.consecutiveFailures > 1) {
              yield sleep(retryInterval(this.consecutiveFailures));
            }
            yield this.tokenManager.loadToken();
            return yield this.doAxiosRequest(type, url, data, options2);
          }
          return this.handleResponse(e.response);
        } else {
          this._logApiError(type, url, e);
          throw e;
        }
      }
    });
    this.get = (url, params) => {
      return this.doAxiosRequest("get", url, null, {
        params
      });
    };
    this.put = (url, data, params) => {
      return this.doAxiosRequest("put", url, data, {
        params
      });
    };
    this.post = (url, data, params) => {
      return this.doAxiosRequest("post", url, data, {
        params
      });
    };
    this.patch = (url, data, params) => {
      return this.doAxiosRequest("patch", url, data, {
        params
      });
    };
    this.delete = (url, params) => {
      return this.doAxiosRequest("delete", url, null, {
        params
      });
    };
    this.errorFromResponse = (response) => {
      const {
        data,
        status
      } = response;
      const err = new ErrorFromResponse();
      err.message = `Stream error code ${data.code}: ${data.message}`;
      err.code = data.code;
      err.unrecoverable = data.unrecoverable;
      err.response = response;
      err.status = status;
      return err;
    };
    this.handleResponse = (response) => {
      const data = response.data;
      if (isErrorResponse(response)) {
        throw this.errorFromResponse(response);
      }
      return data;
    };
    this.dispatchEvent = (event) => {
      this.logger("debug", `Dispatching event: ${event.type}`, event);
      if (!this.listeners) return;
      for (const listener of this.listeners.all || []) {
        listener(event);
      }
      for (const listener of this.listeners[event.type] || []) {
        listener(event);
      }
    };
    this.connect = () => __async(this, null, function* () {
      if (!this.userID || !this._user) {
        throw Error("Call connectUser or connectAnonymousUser before starting the connection");
      }
      if (!this.wsBaseURL) throw Error("Websocket base url not set");
      if (!this.clientID) throw Error("clientID is not set");
      this.wsConnection = new StableWSConnection(this);
      this.logger("info", "StreamClient.connect: this.wsConnection.connect()");
      return yield this.wsConnection.connect(this.defaultWSTimeout);
    });
    this.getUserAgent = () => {
      if (!this.cachedUserAgent) {
        const {
          clientAppIdentifier = {}
        } = this.options;
        const _a = clientAppIdentifier, {
          sdkName = "js",
          sdkVersion = "1.21.0"
        } = _a, extras = __objRest(_a, [
          "sdkName",
          "sdkVersion"
        ]);
        this.cachedUserAgent = [`stream-video-${sdkName}-v${sdkVersion}`, ...Object.entries(extras).map(([key2, value]) => `${key2}=${value}`), `client_bundle=${"browser-esm"}`].join("|");
      }
      return this.cachedUserAgent;
    };
    this._enrichAxiosOptions = (options2 = {
      params: {},
      headers: {},
      config: {}
    }) => {
      const token = options2.publicEndpoint && !this.user ? void 0 : this._getToken();
      const authorization = token ? {
        Authorization: token
      } : void 0;
      if (!options2.headers?.["x-client-request-id"]) {
        options2.headers = __spreadProps(__spreadValues({}, options2.headers), {
          "x-client-request-id": generateUUIDv4()
        });
      }
      return __spreadValues(__spreadValues({
        params: __spreadValues({
          user_id: this.userID,
          connection_id: this._getConnectionID(),
          api_key: this.key
        }, options2.params),
        headers: __spreadValues(__spreadProps(__spreadValues({}, authorization), {
          "stream-auth-type": options2.publicEndpoint && !this.user ? "anonymous" : this.getAuthType(),
          "X-Stream-Client": this.getUserAgent()
        }), options2.headers)
      }, options2.config), this.options.axiosRequestConfig);
    };
    this._getToken = () => {
      if (!this.tokenManager) return null;
      return this.tokenManager.getToken();
    };
    this.updateNetworkConnectionStatus = (event) => {
      if (event.type === "offline") {
        this.logger("debug", "device went offline");
        this.dispatchEvent({
          type: "network.changed",
          online: false
        });
      } else if (event.type === "online") {
        this.logger("debug", "device went online");
        this.dispatchEvent({
          type: "network.changed",
          online: true
        });
      }
    };
    this.key = key;
    this.secret = options?.secret;
    const inputOptions = options ? options : {
      browser: typeof window !== "undefined"
    };
    this.browser = inputOptions.browser || typeof window !== "undefined";
    this.node = !this.browser;
    if (this.browser) {
      this.locationHint = getLocationHint(options?.locationHintUrl, options?.locationHintTimeout, options?.locationHintMaxAttempts);
    }
    this.options = __spreadValues({
      timeout: 5e3,
      withCredentials: false
    }, inputOptions);
    if (this.node && !this.options.httpsAgent) {
      this.options.httpsAgent = new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 3e3
      });
    }
    this.setBaseURL(this.options.baseURL || "https://video.stream-io-api.com/video");
    this.axiosInstance = axios_default.create(__spreadProps(__spreadValues({}, this.options), {
      baseURL: this.baseURL
    }));
    this.wsConnection = null;
    this.wsPromiseSafe = null;
    this.connectUserTask = null;
    this.anonymous = false;
    this.persistUserOnConnectionFailure = this.options?.persistUserOnConnectionFailure;
    this.tokenManager = new TokenManager(this.secret);
    this.consecutiveFailures = 0;
    this.defaultWSTimeout = this.options.defaultWsTimeout ?? 15e3;
    this.logger = isFunction(inputOptions.logger) ? inputOptions.logger : () => null;
  }
  get connectionIdPromise() {
    return this.connectionIdPromiseSafe?.();
  }
  get isConnectionIsPromisePending() {
    return this.connectionIdPromiseSafe?.checkPending() ?? false;
  }
  get wsPromise() {
    return this.wsPromiseSafe?.();
  }
};
var getInstanceKey = (apiKey, user) => {
  return `${apiKey}/${user.id}`;
};
var getClientAppIdentifier = (options) => {
  const appId = options?.clientAppIdentifier || {};
  const sdkInfo2 = getSdkInfo();
  if (sdkInfo2) {
    appId.sdkName = SdkType[sdkInfo2.type].toLowerCase();
    appId.sdkVersion = `${sdkInfo2.major}.${sdkInfo2.minor}.${sdkInfo2.patch}`;
  }
  return appId;
};
var createCoordinatorClient = (apiKey, options) => {
  const clientAppIdentifier = getClientAppIdentifier(options);
  const coordinatorLogger = getLogger(["coordinator"]);
  return new StreamClient(apiKey, __spreadProps(__spreadValues({
    persistUserOnConnectionFailure: true
  }, options), {
    clientAppIdentifier,
    logger: coordinatorLogger
  }));
};
var createTokenOrProvider = (options) => {
  const {
    token,
    tokenProvider
  } = options;
  if (token && tokenProvider) {
    let initialTokenUsed = false;
    return function wrappedTokenProvider() {
      return __async(this, null, function* () {
        if (!initialTokenUsed) {
          initialTokenUsed = true;
          return token;
        }
        return tokenProvider();
      });
    };
  }
  return token || tokenProvider;
};
var StreamVideoClient = class _StreamVideoClient {
  constructor(apiKeyOrArgs, opts) {
    this.effectsRegistered = false;
    this.eventHandlersToUnregister = [];
    this.connectionConcurrencyTag = Symbol("connectionConcurrencyTag");
    this.registerClientInstance = (apiKey2, user) => {
      const instanceKey = getInstanceKey(apiKey2, user);
      if (_StreamVideoClient._instances.has(instanceKey)) {
        this.logger("warn", `A StreamVideoClient already exists for ${user.id}; Prefer using getOrCreateInstance method`);
      }
      _StreamVideoClient._instances.set(instanceKey, this);
    };
    this.registerEffects = () => {
      if (this.effectsRegistered) return;
      this.eventHandlersToUnregister.push(this.on("connection.changed", (event) => {
        if (!event.online) return;
        const callsToReWatch = this.writeableStateStore.calls.filter((call) => call.watching).map((call) => call.cid);
        if (callsToReWatch.length <= 0) return;
        this.logger("info", `Rewatching calls ${callsToReWatch.join(", ")}`);
        this.queryCalls({
          watch: true,
          filter_conditions: {
            cid: {
              $in: callsToReWatch
            }
          },
          sort: [{
            field: "cid",
            direction: 1
          }]
        }).catch((err) => {
          this.logger("error", "Failed to re-watch calls", err);
        });
      }));
      this.eventHandlersToUnregister.push(this.on("call.created", (event) => {
        const {
          call,
          members
        } = event;
        if (this.state.connectedUser?.id === call.created_by.id) {
          this.logger("warn", "Received `call.created` sent by the current user");
          return;
        }
        this.logger("info", `New call created and registered: ${call.cid}`);
        const newCall = new Call({
          streamClient: this.streamClient,
          type: call.type,
          id: call.id,
          members,
          clientStore: this.writeableStateStore
        });
        newCall.state.updateFromCallResponse(call);
        this.writeableStateStore.registerCall(newCall);
      }));
      this.eventHandlersToUnregister.push(this.on("call.ring", (event) => __async(this, null, function* () {
        const {
          call,
          members
        } = event;
        if (this.state.connectedUser?.id === call.created_by.id) {
          this.logger("debug", "Received `call.ring` sent by the current user so ignoring the event");
          return;
        }
        const theCall = this.writeableStateStore.findCall(call.type, call.id);
        if (theCall) {
          yield theCall.updateFromRingingEvent(event);
        } else {
          const newCallInstance = new Call({
            streamClient: this.streamClient,
            type: call.type,
            id: call.id,
            members,
            clientStore: this.writeableStateStore,
            ringing: true
          });
          yield newCallInstance.get();
        }
      })));
      this.effectsRegistered = true;
    };
    this.connectUser = (user, tokenOrProvider) => __async(this, null, function* () {
      if (user.type === "anonymous") {
        user.id = "!anon";
        return this.connectAnonymousUser(user, tokenOrProvider);
      }
      const connectUserResponse = yield withoutConcurrency(this.connectionConcurrencyTag, () => __async(this, null, function* () {
        const client = this.streamClient;
        const {
          onConnectUserError,
          persistUserOnConnectionFailure
        } = client.options;
        let {
          maxConnectUserRetries = 5
        } = client.options;
        maxConnectUserRetries = Math.max(maxConnectUserRetries, 1);
        const errorQueue = [];
        for (let attempt = 0; attempt < maxConnectUserRetries; attempt++) {
          try {
            this.logger("trace", `Connecting user (${attempt})`, user);
            return user.type === "guest" ? yield client.connectGuestUser(user) : yield client.connectUser(user, tokenOrProvider);
          } catch (err) {
            this.logger("warn", `Failed to connect a user (${attempt})`, err);
            errorQueue.push(err);
            if (attempt === maxConnectUserRetries - 1) {
              onConnectUserError?.(err, errorQueue);
              throw err;
            }
            if (persistUserOnConnectionFailure) {
              yield client.disconnectUser();
            }
            yield sleep(retryInterval(attempt));
          }
        }
      }));
      if (connectUserResponse?.me) {
        this.writeableStateStore.setConnectedUser(connectUserResponse.me);
      }
      this.registerEffects();
      return connectUserResponse;
    });
    this.disconnectUser = (timeout) => __async(this, null, function* () {
      yield withoutConcurrency(this.connectionConcurrencyTag, () => __async(this, null, function* () {
        const {
          user,
          key
        } = this.streamClient;
        if (!user) return;
        yield this.streamClient.disconnectUser(timeout);
        if (user.id) {
          _StreamVideoClient._instances.delete(getInstanceKey(key, user));
        }
        this.eventHandlersToUnregister.forEach((unregister) => unregister());
        this.eventHandlersToUnregister = [];
        this.effectsRegistered = false;
        this.writeableStateStore.setConnectedUser(void 0);
      }));
    });
    this.on = (eventName, callback) => {
      return this.streamClient.on(eventName, callback);
    };
    this.off = (eventName, callback) => {
      return this.streamClient.off(eventName, callback);
    };
    this.call = (type, id) => {
      return new Call({
        streamClient: this.streamClient,
        id,
        type,
        clientStore: this.writeableStateStore
      });
    };
    this.createGuestUser = (data) => __async(this, null, function* () {
      return this.streamClient.doAxiosRequest("post", "/guest", data, {
        publicEndpoint: true
      });
    });
    this.queryCalls = (..._0) => __async(this, [..._0], function* (data = {}) {
      const response = yield this.streamClient.post("/calls", data);
      const calls = [];
      for (const c of response.calls) {
        const call = new Call({
          streamClient: this.streamClient,
          id: c.call.id,
          type: c.call.type,
          members: c.members,
          ownCapabilities: c.own_capabilities,
          watching: data.watch,
          clientStore: this.writeableStateStore
        });
        call.state.updateFromCallResponse(c.call);
        yield call.applyDeviceConfig(c.call.settings, false);
        if (data.watch) {
          yield call.setup();
          this.writeableStateStore.registerCall(call);
        }
        calls.push(call);
      }
      return __spreadProps(__spreadValues({}, response), {
        calls
      });
    });
    this.queryCallStats = (..._0) => __async(this, [..._0], function* (data = {}) {
      return this.streamClient.post(`/call/stats`, data);
    });
    this.queryAggregateCallStats = (..._0) => __async(this, [..._0], function* (data = {}) {
      return this.streamClient.post(`/stats`, data);
    });
    this.edges = () => __async(this, null, function* () {
      return this.streamClient.get(`/edges`);
    });
    this.addDevice = (id, push_provider, push_provider_name, userID, voip_token) => __async(this, null, function* () {
      return yield this.streamClient.post("/devices", __spreadValues(__spreadValues({
        id,
        push_provider,
        voip_token
      }, userID != null ? {
        user_id: userID
      } : {}), push_provider_name != null ? {
        push_provider_name
      } : {}));
    });
    this.addVoipDevice = (id, push_provider, push_provider_name, userID) => __async(this, null, function* () {
      return yield this.addDevice(id, push_provider, push_provider_name, userID, true);
    });
    this.getDevices = (userID) => __async(this, null, function* () {
      return yield this.streamClient.get("/devices", userID ? {
        user_id: userID
      } : {});
    });
    this.removeDevice = (id, userID) => __async(this, null, function* () {
      return yield this.streamClient.delete("/devices", __spreadValues({
        id
      }, userID ? {
        user_id: userID
      } : {}));
    });
    this.onRingingCall = (call_cid) => __async(this, null, function* () {
      let call = this.state.calls.find((c) => c.cid === call_cid && c.ringing);
      if (!call) {
        const [callType, callId] = call_cid.split(":");
        call = new Call({
          streamClient: this.streamClient,
          type: callType,
          id: callId,
          clientStore: this.writeableStateStore,
          ringing: true
        });
        yield call.get();
      }
      return call;
    });
    this.connectAnonymousUser = (user, tokenOrProvider) => __async(this, null, function* () {
      return withoutConcurrency(this.connectionConcurrencyTag, () => this.streamClient.connectAnonymousUser(user, tokenOrProvider));
    });
    const apiKey = typeof apiKeyOrArgs === "string" ? apiKeyOrArgs : apiKeyOrArgs.apiKey;
    const clientOptions = typeof apiKeyOrArgs === "string" ? opts : apiKeyOrArgs.options;
    if (clientOptions?.enableTimerWorker) enableTimerWorker();
    const rootLogger = clientOptions?.logger || logToConsole;
    setLogger(rootLogger, clientOptions?.logLevel || "warn");
    this.logger = getLogger(["client"]);
    this.streamClient = createCoordinatorClient(apiKey, clientOptions);
    this.writeableStateStore = new StreamVideoWriteableStateStore();
    this.readOnlyStateStore = new StreamVideoReadOnlyStateStore(this.writeableStateStore);
    if (typeof apiKeyOrArgs !== "string" && apiKeyOrArgs.user) {
      const user = apiKeyOrArgs.user;
      if (user.type === "anonymous") user.id = "!anon";
      if (user.id) this.registerClientInstance(apiKey, user);
      const tokenOrProvider = createTokenOrProvider(apiKeyOrArgs);
      this.connectUser(user, tokenOrProvider).catch((err) => {
        this.logger("error", "Failed to connect", err);
      });
    }
  }
  /**
   * Gets or creates a StreamVideoClient instance based on the given options.
   */
  static getOrCreateInstance(args) {
    const {
      apiKey,
      user,
      token,
      tokenProvider
    } = args;
    if (!user.id && user.type !== "anonymous") {
      throw new Error("user.id is required for a non-anonymous user");
    }
    if (!token && !tokenProvider && user.type !== "anonymous" && user.type !== "guest") {
      throw new Error("tokenProvider or token is required for a authenticated users");
    }
    return _StreamVideoClient._instances.get(getInstanceKey(apiKey, user)) || new _StreamVideoClient(args);
  }
  /**
   * Return the reactive state store, use this if you want to be notified about changes to the client state
   */
  get state() {
    return this.readOnlyStateStore;
  }
};
StreamVideoClient._instances = /* @__PURE__ */ new Map();
export {
  AudioSettingsRequestDefaultDeviceEnum,
  AudioSettingsResponseDefaultDeviceEnum,
  AxiosError,
  browsers as Browsers,
  Call,
  CallState,
  CallType,
  CallTypes,
  CallingState,
  CameraManager,
  CameraManagerState,
  CreateDeviceRequestPushProviderEnum,
  DebounceType,
  DynascaleManager,
  ErrorFromResponse,
  FrameRecordingSettingsRequestModeEnum,
  FrameRecordingSettingsRequestQualityEnum,
  FrameRecordingSettingsResponseModeEnum,
  InputMediaDeviceManager,
  InputMediaDeviceManagerState,
  LayoutSettingsRequestNameEnum,
  MicrophoneManager,
  MicrophoneManagerState,
  NoiseCancellationSettingsModeEnum,
  OwnCapability,
  RTMPBroadcastRequestQualityEnum,
  RTMPSettingsRequestQualityEnum,
  RecordSettingsRequestModeEnum,
  RecordSettingsRequestQualityEnum,
  rxUtils as RxUtils,
  ScreenShareManager,
  ScreenShareState,
  events as SfuEvents,
  models as SfuModels,
  SpeakerManager,
  SpeakerState,
  StreamSfuClient,
  StreamVideoClient,
  StreamVideoReadOnlyStateStore,
  StreamVideoWriteableStateStore,
  TranscriptionSettingsRequestClosedCaptionModeEnum,
  TranscriptionSettingsRequestLanguageEnum,
  TranscriptionSettingsRequestModeEnum,
  TranscriptionSettingsResponseClosedCaptionModeEnum,
  TranscriptionSettingsResponseLanguageEnum,
  TranscriptionSettingsResponseModeEnum,
  VideoSettingsRequestCameraFacingEnum,
  VideoSettingsResponseCameraFacingEnum,
  ViewportTracker,
  VisibilityState,
  checkIfAudioOutputChangeSupported,
  combineComparators,
  conditional,
  createSoundDetector,
  defaultSortPreset,
  descending,
  deviceIds$,
  disposeOfMediaStream,
  dominantSpeaker,
  getAudioBrowserPermission,
  getAudioDevices,
  getAudioOutputDevices,
  getAudioStream,
  getClientDetails,
  getDeviceState,
  getLogLevel,
  getLogger,
  getScreenShareStream,
  getSdkInfo,
  getVideoBrowserPermission,
  getVideoDevices,
  getVideoStream,
  getWebRTCInfo,
  hasAudio,
  hasScreenShare,
  hasScreenShareAudio,
  hasVideo,
  isPinned,
  livestreamOrAudioRoomSortPreset,
  logLevels,
  logToConsole,
  name,
  noopComparator,
  paginatedLayoutSortPreset,
  pinned,
  publishingAudio,
  publishingVideo,
  reactionType,
  role,
  screenSharing,
  setDeviceInfo,
  setLogLevel,
  setLogger,
  setOSInfo,
  setPowerState,
  setSdkInfo,
  setThermalState,
  setWebRTCInfo,
  speakerLayoutSortPreset,
  speaking
};
//# sourceMappingURL=@stream-io_video-client.js.map
