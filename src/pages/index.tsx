import * as React from 'react';
import Image, { ImageProps } from 'next/image';
import { GetStaticProps } from 'next';
import clsxm from '@/lib/clsxm';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BiDownload } from 'react-icons/bi';

type PageProps = {
  data: {
    id: string;
    author: string;
    width: number;
    height: number;
    url: string;
    download_url: string;
  }[];
};

export default function HomePage({ data }: PageProps) {
  const [images1, setImages1] = useState<PageProps['data']>(data.slice(0, 10));
  const [images2, setImages2] = useState<PageProps['data']>(data.slice(10, 20));
  const [images3, setImages3] = useState<PageProps['data']>(data.slice(20));
  const [page, setPage] = useState(2);
  const [dialogImg, setDialogImg] = useState<string | null>();
  const loadMoreRef = useRef(null);
  const isFetchingRef = useRef(false);

  useEffect(
    function fetchMore() {
      const fetch = async () => {
        isFetchingRef.current = true;
        const newData: PageProps['data'] = await fetchData(page);
        isFetchingRef.current = false;

        setImages1((prev) => [...prev, ...newData.slice(0, 10)]);
        setImages2((prev) => [...prev, ...newData.slice(10, 20)]);
        setImages3((prev) => [...prev, ...newData.slice(20)]);
      };

      if (!isFetchingRef.current) {
        fetch();
      }
    },
    [page]
  );

  const handleObserver = useCallback<IntersectionObserverCallback>(
    async (entries) => {
      const [target] = entries;
      if (target.isIntersecting && !isFetchingRef.current) {
        setPage((page) => page + 1);
      }
    },
    []
  );

  useEffect(
    function infiniteScroll() {
      const option = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      };

      const observer = new IntersectionObserver(handleObserver, option);

      if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    },
    [handleObserver]
  );

  return (
    <main className='flex flex-col items-center'>
      <section className='m-4 flex max-w-[1444px] gap-4 bg-white lg:m-8 lg:gap-8'>
        <div className='flex w-1/2 flex-col gap-4 text-center lg:w-1/3 lg:gap-8'>
          {images1.map((img, idx) => (
            <ImageCard
              onClick={() => setDialogImg(img.download_url)}
              key={img.id + '-' + idx}
              src={img.download_url}
              width={img.width}
              height={img.height}
              author={img.author}
              id={img.id}
            />
          ))}
        </div>
        <div className='flex w-1/2 flex-col gap-4 text-center lg:w-1/3 lg:gap-8'>
          {images2.map((img, idx) => (
            <ImageCard
              onClick={() => setDialogImg(img.download_url)}
              key={img.id + '-' + idx}
              src={img.download_url}
              width={img.width}
              height={img.height}
              author={img.author}
              id={img.id}
            />
          ))}
        </div>
        <div className='hidden w-1/2 flex-col gap-4 text-center lg:flex lg:w-1/3 lg:gap-8'>
          {images3.map((img, idx) => (
            <ImageCard
              onClick={() => setDialogImg(img.download_url)}
              key={img.id + '-' + idx}
              src={img.download_url}
              width={img.width}
              height={img.height}
              author={img.author}
              id={img.id}
            />
          ))}
        </div>
      </section>
      <dialog
        open={!!dialogImg}
        onClick={() => setDialogImg(null)}
        className='group fixed flex items-center justify-center bg-transparent open:h-full open:w-full open:bg-slate-800/70'
      >
        <img
          className='max-h-screen max-w-screen-xl group-open:p-4'
          src={dialogImg ?? undefined}
        />
      </dialog>
      <footer className='my-8 text-center' ref={loadMoreRef}>
        footer
      </footer>
    </main>
  );
}

const ImageCard: React.FC<{ author: string } & ImageProps> = ({
  src,
  width,
  height,
  author,
  id,
  onClick,
  ...rest
}) => {
  const [imgBlob, setImgBlob] = useState<string>();
  return (
    <div onClick={onClick} className={`group relative cursor-pointer`}>
      <Image
        className={clsxm('bg-gray-300')}
        width={width}
        height={height}
        src={src}
        onMouseEnter={() => {
          if (imgBlob) return;

          // download the image so the user can save it
          fetch(src as string)
            .then((resp) => resp.blob())
            .then((blobobject) => {
              const blob = window.URL.createObjectURL(blobobject);
              setImgBlob(blob);
            })
            .catch(() =>
              console.log('An error ocurred while downloading the image')
            );
        }}
        {...rest}
      />
      <div className='absolute inset-0  h-full w-full bg-gradient-to-t from-slate-900/90 via-transparent to-slate-900/90 opacity-0 duration-300 ease-in-out group-hover:opacity-100'>
        <div className='m-4 flex justify-between text-white'>
          <div className='flex'>{author}</div>
          <a href={imgBlob} download={id}>
            <BiDownload className='hover:text-slate-300 active:text-slate-400'></BiDownload>
          </a>
        </div>
      </div>
    </div>
  );
};

const fetchData = async (page: number) => {
  const res = await fetch(`https://picsum.photos/v2/list?page=${page}`);
  const data = await res.json();
  return data;
};

export const getStaticProps: GetStaticProps = async () => {
  const data = await fetchData(1);
  return {
    props: { data },
  };
};
