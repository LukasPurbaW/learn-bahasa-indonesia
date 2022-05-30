import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { BaseHit } from "instantsearch.js";
import type { NextPage } from "next";
import Head from "next/head";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  Configure,
  InstantSearch,
  SearchBox,
  useHits,
  UseHitsProps,
  RefinementList,
} from "react-instantsearch-hooks-web";
import styles from "../styles/Home.module.css";
import YouTube from "react-youtube";
import { styled } from "@stitches/react";
import { mauve } from "@radix-ui/colors";

interface SpeechFragment {
  word: string;
  freq: number;
  meaning?: string;
}

interface Speech {
  id: string;
  fragments: SpeechFragment[];
  start: number;
  end: number;
  video: string;
  channel: string;
}

type Hit = Speech & {
  _highlightResult: { [id in keyof Speech]: { value: Speech[id] } };
  _snippetResult: { [id in keyof Speech]: { value: Speech[id] } };
  __position: number;
};

const searchClient = instantMeiliSearch("http://localhost:7700");

const Flex = styled("div", { display: "flex" });

const StyledContent = styled(Tooltip.Content, {
  borderRadius: 4,
  padding: "10px 15px",
  fontSize: 15,
  lineHeight: 1,
  backgroundColor: "white",
  boxShadow:
    "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
  "@media (prefers-reduced-motion: no-preference)": {
    animationDuration: "400ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "forwards",
    willChange: "transform, opacity",
  },
});

function Video(props: { video: string; start: number; end: number }) {
  return (
    <YouTube
      videoId={props.video}
      opts={{
        height: "200",
        width: "100%",
        playerVars: {
          // https://developers.google.com/youtube/player_parameters
          modestbranding: 1,
          rel: 0,
          autoplay: 0,
          loop: 1,
          start: props.start,
          end: props.end,
        },
      }}
      loading="lazy"
      onEnd={(e) => {
        // https://developers.google.com/youtube/iframe_api_reference
        const player = e.target;
        player.seekTo(props.start);
        player.pauseVideo();
      }}
    />
  );
}

const StyledArrow = styled(Tooltip.Arrow, {
  fill: "white",
});

const WordWithInfo = styled("span", {
  color: "#e34b4b",
  // borderBottom: "3px dotted green",
});

const Text = styled("div", {
  margin: 0,
  color: mauve.mauve12,
  fontSize: 15,
  lineHeight: 1.5,
  variants: {
    faded: {
      true: { color: mauve.mauve10 },
    },
    bold: {
      true: { fontWeight: 500 },
    },
  },
});

function Speech({ fragments }: { fragments: SpeechFragment[] }) {
  return (
    <Tooltip.Provider>
      <h2>
        🗣{" "}
        {fragments.map((frag, i) => (
          <span key={frag.word + i}>
            {frag.meaning ? (
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                  <WordWithInfo>{frag.word} </WordWithInfo>
                </Tooltip.Trigger>
                <StyledContent>
                  <Flex css={{ gap: 5 }}>
                    <Text bold>{frag.meaning ?? ""}</Text>
                  </Flex>

                  <Flex css={{ gap: 5 }}>
                    <Text faded>Frequency</Text>
                    <Text>{frag.freq}</Text>
                  </Flex>
                  <StyledArrow />
                </StyledContent>
              </Tooltip.Root>
            ) : (
              <span>{frag.word} </span>
            )}
          </span>
        ))}
      </h2>
    </Tooltip.Provider>
  );
}

function CustomHits(props: UseHitsProps) {
  // @ts-ignore
  const { hits } = useHits<Hit>(props);

  return (
    <div className={styles.hits}>
      {hits.map((hit) => (
        <div key={hit.id} className={styles.hit}>
          <Video video={hit.video} start={hit.start} end={hit.end} />
          <Speech fragments={hit.fragments} />
        </div>
      ))}
    </div>
  );
}

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Do HoloID Say It</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/instantsearch.css@7.3.1/themes/reset-min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@meilisearch/instant-meilisearch/templates/basic_search.css"
        />
      </Head>

      <main className={styles.main}>
        <InstantSearch indexName="speeches" searchClient={searchClient}>
          <Configure hitsPerPage={9} />
          <div className={styles.search}>
            <SearchBox />
            <RefinementList attribute="channel" />
          </div>
          <CustomHits />
        </InstantSearch>
      </main>
    </div>
  );
};

export default Home;
