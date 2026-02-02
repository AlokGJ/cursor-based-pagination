import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const useGallery = () => {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    const getItems = async (page: number): Promise<Array<unknown>> => {
      const response = await fetch(
        `https://picsum.photos/v2/list?page=${page}`,
        { signal: controller.signal }
      );

      return await response.json();
    };
    getItems(currentPage).then((data) => {
      setItems((prev) => [...prev, ...data]);
    });
  }, [currentPage]);

  return {
    items,
    currentPage,
    fetchNextPage: setCurrentPage,
  };
};

const useInfiniteScroll = (callback: Function) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    if (scrollRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log('Interacting');
              callback();
            }
          });
        },
        {
          threshold: 0.25,
        }
      );

      setTimeout(() => !!observer && observer.observe(scrollRef.current), 5000);
    }

    return () => {
      !!observer && scrollRef.current && observer.unobserve(scrollRef.current);
    };
  }, []);

  return scrollRef;
};

export const Gallery = () => {
  const { items, fetchNextPage } = useGallery();
  const onScroll = useCallback(() => {
    console.log('Scrolled');
    fetchNextPage((prev) => prev + 1);
  }, []);
  const scrollRef = useInfiniteScroll(onScroll);
  return (
    <div className="gallery-container">
      {items?.map((item) => (
        <GalleryItem item={item} />
      ))}
      <div ref={scrollRef} className="scroll-bottom" />
    </div>
  );
};

const GalleryItem = ({ item }) => {
  return (
    <div className="gallery-item">
      <img loading='eager'  src={item.download_url} alt="Gallery image not found" />
      <span>{item.author}</span>
    </div>
  );
};

/**
 ContextProvider
  - <Context.Provider value={[list]} >
    <Gallery />
    <Paginator />
    

 */
