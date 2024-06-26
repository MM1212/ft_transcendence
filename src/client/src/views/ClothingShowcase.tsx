import ChevronRightIcon from '@components/icons/ChevronRightIcon';
import { useDebounce } from '@hooks/lodash';
import { Button, Checkbox } from '@mui/joy';
import { Divider, Input, Sheet, Stack } from '@mui/joy';
import React from 'react';

export default function ClothingShowcase(): JSX.Element {
  const [input, setInput] = React.useState<string>('');
  const [clothId, setClothId] = React.useState<number>(1);
  const [skip, setSkip] = React.useState<boolean>(false);

  const updateClothId = useDebounce(setClothId, 300, []);

  React.useEffect(() => {
    if (input.trim().length && !isNaN(parseInt(input))) {
      updateClothId(parseInt(input));
    }
  }, [input, updateClothId]);

  React.useEffect(() => {
    setClothId((prev) => prev + 1);
  }, [skip]);

  React.useEffect(() => {
    setInput(clothId.toString());
  }, [clothId]);

  return (
    <Sheet
      sx={{
        p: 2,
        height: '100%',
        width: '80dvh',
        overflow: 'auto',
        borderLeft: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Input
        type="number"
        placeholder="Clothing ID"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        sx={{
          mb: 2,
        }}
        endDecorator={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              color="primary"
              variant="solid"
              size="lg"
              startDecorator={<ChevronRightIcon />}
              onClick={() => setClothId((prev) => prev + 1)}
            >
              Next
            </Button>
            <Checkbox
              checked={skip}
              color="primary"
              onChange={(e) => setSkip(e.target.checked)}
              label="Skip"
            />
          </Stack>
        }
      />
      <Divider />
      <Sheet
        variant="outlined"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          width: '100%',
          gap: 2,
        }}
      >
        {clothId !== null && (
          <Stack
            spacing={1}
            p={2}
            sx={{
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <Sheet
                variant="outlined"
                sx={{
                  p: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  width: 500,
                  height: 500,
                }}
              >
                <img
                  src={`https://de7j6vhmj5vf1.cloudfront.net/assets/media/clothing/paper/${clothId}_back.webp`}
                  alt={`Clothing ${clothId}`}
                  style={{
                    backgroundColor: 'cyan',
                    width: 2000,
                  }}
                />
                <img
                  src={`https://de7j6vhmj5vf1.cloudfront.net/assets/media/clothing/paper/${clothId}.webp`}
                  alt={`Clothing ${clothId}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                  }}
                  onError={() => skip && setClothId((prev) => prev + 1)}
                  onLoad={() => setSkip(false)}
                />
              </Sheet>
              <Stack spacing={1}>
                <Sheet
                  variant="outlined"
                  sx={{
                    p: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                ></Sheet>
                <Sheet
                  variant="outlined"
                  sx={{
                    p: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={`https://de7j6vhmj5vf1.cloudfront.net/assets/media/clothing/icon/${clothId}.webp`}
                    alt={`Clothing ${clothId}`}
                    style={{
                      backgroundColor: 'cyan',
                      width: 100,
                      aspectRatio: 1,
                    }}
                  />
                </Sheet>
              </Stack>
            </Stack>
            <img
              src={`https://de7j6vhmj5vf1.cloudfront.net/assets/media/clothing/sprites/${clothId}-0.webp`}
              alt={`Clothing ${clothId}`}
              style={{
                backgroundColor: 'cyan',
                width: 'auto',
                flex: 2,
              }}
            />
          </Stack>
        )}
      </Sheet>
    </Sheet>
  );
}
